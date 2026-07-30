import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import {
  AdminUser as PrismaAdminUser,
  Commerce as PrismaCommerce,
  Prisma,
  User as PrismaUser,
  UserPointsGlobal as PrismaUserPointsGlobal,
} from '@prisma/client';
import { AdminRole } from '@localnow/shared';
import { ClerkService } from '../clerk-auth/clerk.service';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { CommerceService } from '../commerce/commerce.service';
import type { CreateCommerceDto } from '../commerce/dto/create-commerce.dto';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { RegisterUserDto } from './dto/register-user.dto';
import type { AuthCommerceResult, AuthIdentityResult, AuthUserResult } from './types';

type UserWithPoints = PrismaUser & { pointsGlobal: PrismaUserPointsGlobal | null };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clerkService: ClerkService,
    private readonly commerceService: CommerceService,
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

  // La creación real (slug, validación de ciudad, active/verified=false...) vive en
  // CommerceService — es el mismo comercio que se gestiona luego desde POST /commerce,
  // no tiene sentido duplicar esa lógica aquí.
  async registerCommerce(claims: ClerkJwtClaims, dto: CreateCommerceDto): Promise<AuthCommerceResult> {
    const commerce = await this.commerceService.create(claims.sub, dto);
    return this.toCommerceResult(commerce, claims.sub);
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
      return this.toCommerceResult(commerce, authId);
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

  // authId se pasa explícito en vez de leer commerce.authId (nullable desde §9.4:
  // un comercio dado de alta por un admin desde un lead nace sin cuenta todavía) —
  // aquí siempre es no-nulo por construcción, ambos llamadores lo obtienen del JWT
  // ya verificado que se usó para encontrar/crear este mismo comercio.
  private toCommerceResult(commerce: PrismaCommerce, authId: string): AuthCommerceResult {
    return {
      role: 'commerce',
      id: commerce.id,
      authId,
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
