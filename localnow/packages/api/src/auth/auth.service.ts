import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import {
  AdminUser as PrismaAdminUser,
  Commerce as PrismaCommerce,
  CommerceCategory as PrismaCommerceCategory,
  Prisma,
  User as PrismaUser,
  UserPointsGlobal as PrismaUserPointsGlobal,
} from '@prisma/client';
import { AdminRole } from '@localnow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { ClerkService } from './clerk.service';
import { RegisterCommerceDto } from './dto/register-commerce.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import type { AuthCommerceResult, AuthIdentityResult, AuthUserResult, ClerkJwtClaims } from './types';

type UserWithPoints = PrismaUser & { pointsGlobal: PrismaUserPointsGlobal | null };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clerkService: ClerkService,
  ) {}

  async registerUser(claims: ClerkJwtClaims, dto: RegisterUserDto): Promise<AuthUserResult> {
    const authId = claims.sub;

    const existing = await this.prisma.user.findUnique({ where: { authId } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario registrado con esta cuenta');
    }

    if (dto.cityId) {
      await this.assertCityExists(dto.cityId);
    }

    const email = await this.clerkService.getPrimaryEmail(authId);

    try {
      const user = await this.prisma.user.create({
        data: {
          authId,
          email,
          name: dto.name ?? null,
          phone: dto.phone ?? null,
          cityId: dto.cityId ?? null,
          consentDataUsage: dto.consentDataUsage,
          // Timestamp del consentimiento RGPD solo si se otorgó (§14)
          consentDate: dto.consentDataUsage ? new Date() : null,
          pointsGlobal: { create: {} },
        },
        include: { pointsGlobal: true },
      });
      return this.toUserResult(user);
    } catch (error) {
      this.handleUniqueConstraintError(error, 'usuario');
    }
  }

  async registerCommerce(claims: ClerkJwtClaims, dto: RegisterCommerceDto): Promise<AuthCommerceResult> {
    const authId = claims.sub;

    const existing = await this.prisma.commerce.findUnique({ where: { authId } });
    if (existing) {
      throw new ConflictException('Ya existe un comercio registrado con esta cuenta');
    }

    await this.assertCityExists(dto.cityId);

    const slug = await this.generateUniqueCommerceSlug(dto.name);

    try {
      const commerce = await this.prisma.commerce.create({
        data: {
          authId,
          name: dto.name,
          slug,
          cityId: dto.cityId,
          category: mirrorEnum<PrismaCommerceCategory>(dto.category),
          cif: dto.cif,
          address: dto.address,
          lat: dto.lat ?? null,
          lng: dto.lng ?? null,
          phone: dto.phone ?? null,
          email: dto.email,
          logoUrl: dto.logoUrl ?? null,
          description: dto.description ?? null,
          schedule: dto.schedule,
          // El alta queda pendiente de revisión manual (§9.1) — nunca se activa/verifica
          // en el registro, sin importar lo que llegue en el body.
          active: false,
          verified: false,
        },
      });
      return this.toCommerceResult(commerce);
    } catch (error) {
      this.handleUniqueConstraintError(error, 'comercio');
    }
  }

  // Cliente ya autenticado con Clerk que llama a nuestra API por primera vez: si no
  // tiene perfil LocalNow todavía, se autoprovisiona como User (los Commerce y
  // AdminUser NUNCA se autoprovisionan aquí: requieren su propio flujo de alta/revisión
  // o alta manual interna — hacerlo en login abriría la puerta a saltarse la moderación
  // de §9.1).
  async login(claims: ClerkJwtClaims): Promise<AuthIdentityResult> {
    return this.resolveIdentity(claims, { autoProvisionUser: true });
  }

  // El refresco real del token de sesión lo gestiona el SDK cliente de Clerk de forma
  // transparente — Clerk no expone esa operación a un backend custom. Este endpoint
  // simplemente re-valida el token vigente y re-sincroniza el perfil/puntos locales.
  // A diferencia de login(), NO autoprovisiona: si no existe cuenta, es un estado de
  // error (la cuenta debería haberse creado ya vía /register o un login previo).
  async refresh(claims: ClerkJwtClaims): Promise<AuthIdentityResult> {
    return this.resolveIdentity(claims, { autoProvisionUser: false });
  }

  // Clerk gestiona el token en el cliente de forma stateless, pero sí mantiene sesiones
  // revocables server-side. Cerramos sesión de verdad (no es un no-op): revocarla aquí
  // desconecta al usuario de todos los clientes donde tuviera esa sesión activa.
  async logout(claims: ClerkJwtClaims): Promise<void> {
    await this.clerkService.revokeSession(claims.sid);
  }

  private async resolveIdentity(
    claims: ClerkJwtClaims,
    options: { autoProvisionUser: boolean },
  ): Promise<AuthIdentityResult> {
    const authId = claims.sub;

    // Orden de prioridad: admin > commerce > user. Un mismo authId de Clerk representa
    // exactamente un tipo de cuenta en LocalNow.
    const admin = await this.prisma.adminUser.findUnique({ where: { authId } });
    if (admin) {
      return this.toAdminResult(admin);
    }

    const commerce = await this.prisma.commerce.findUnique({ where: { authId } });
    if (commerce) {
      return this.toCommerceResult(commerce);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { authId },
      include: { pointsGlobal: true },
    });
    if (existingUser) {
      return this.toUserResult(existingUser);
    }

    if (!options.autoProvisionUser) {
      throw new UnauthorizedException(
        'No existe ninguna cuenta LocalNow para este token. Regístrate primero.',
      );
    }

    const email = await this.clerkService.getPrimaryEmail(authId);
    const createdUser = await this.prisma.user.create({
      data: { authId, email, pointsGlobal: { create: {} } },
      include: { pointsGlobal: true },
    });
    return this.toUserResult(createdUser);
  }

  private async assertCityExists(cityId: string): Promise<void> {
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new BadRequestException(`La ciudad ${cityId} no existe`);
    }
  }

  private async generateUniqueCommerceSlug(name: string): Promise<string> {
    const base = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    const maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const collision = await this.prisma.commerce.findUnique({ where: { slug: candidate } });
      if (!collision) {
        return candidate;
      }
    }
    throw new ConflictException('No se pudo generar un slug único para el comercio, inténtalo con otro nombre');
  }

  private handleUniqueConstraintError(error: unknown, entity: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = error.meta?.target;
      const fields = Array.isArray(target) ? target.join(', ') : 'un campo único';
      throw new ConflictException(`Ya existe un ${entity} con ese valor en: ${fields}`);
    }
    throw error;
  }

  private toUserResult(user: UserWithPoints): AuthUserResult {
    if (!user.pointsGlobal) {
      // No debería ocurrir nunca: todo User se crea con su pointsGlobal en la misma
      // escritura (ver registerUser/resolveIdentity). Si pasa, es un dato corrupto.
      throw new InternalServerErrorException('El usuario no tiene puntos globales asociados');
    }

    return {
      role: 'user',
      id: user.id,
      authId: user.authId,
      email: user.email,
      name: user.name,
      cityId: user.cityId,
      pointsGlobal: {
        balance: user.pointsGlobal.balance,
        totalEarned: user.pointsGlobal.totalEarned,
        totalRedeemed: user.pointsGlobal.totalRedeemed,
      },
    };
  }

  private toCommerceResult(commerce: PrismaCommerce): AuthCommerceResult {
    return {
      role: 'commerce',
      id: commerce.id,
      authId: commerce.authId,
      email: commerce.email,
      name: commerce.name,
      verified: commerce.verified,
      active: commerce.active,
    };
  }

  private toAdminResult(admin: PrismaAdminUser) {
    return {
      role: 'admin' as const,
      id: admin.id,
      authId: admin.authId,
      email: admin.email,
      adminRole: mirrorEnum<AdminRole>(admin.role),
    };
  }
}
