import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  PaymentMethod as PrismaPaymentMethod,
  Transaction as PrismaTransaction,
  TransactionItem as PrismaTransactionItem,
} from '@prisma/client';
import { PaymentMethod, TransactionStatus, TRANSACTION_ANONYMOUS_TIMEOUT_MINUTES } from '@localnow/shared';
import { PointsService } from '../points/points.service';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { QrService } from '../qr/qr.service';
import { ConfirmSaleDto } from './dto/confirm-sale.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import type {
  CommerceSaleSummaryResult,
  PanelDashboardResult,
  SaleCreatedResult,
  TicketItemResult,
  TicketResult,
  TicketSummaryResult,
} from './types';

type TransactionWithItems = PrismaTransaction & { items: PrismaTransactionItem[] };

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly qrService: QrService,
  ) {}

  // §13.1 pasos 1-5: el comercio registra la venta y recibe el QR para mostrar en
  // pantalla. El total y las líneas SIEMPRE se calculan aquí — nunca se acepta un
  // total ya sumado del cliente, para que no pueda desincronizarse de los productos.
  async createSale(commerceAuthId: string, dto: CreateSaleDto): Promise<SaleCreatedResult> {
    const commerce = await this.assertCommerce(commerceAuthId);
    // El panel de venta es parte de la gestión privada, que solo se activa tras la
    // aprobación del alta (§9.1) — un comercio pendiente de revisión no puede vender.
    if (!commerce.active) {
      throw new ForbiddenException('El comercio todavía no está activo — el alta debe aprobarse antes de poder vender');
    }

    for (const item of dto.items) {
      if (item.productId) {
        const product = await this.prisma.product.findFirst({
          where: { id: item.productId, commerceId: commerce.id },
        });
        if (!product) {
          throw new BadRequestException(`El producto ${item.productId} no pertenece a este comercio`);
        }
      }
    }

    const items = dto.items.map((item) => ({
      ...item,
      lineTotal: round2(item.quantity * item.unitPrice),
    }));
    const totalAmount = round2(items.reduce((sum, item) => sum + item.lineTotal, 0));

    const qrToken = this.qrService.generateToken();
    const qrExpiresAt = this.qrService.computeExpiry(TRANSACTION_ANONYMOUS_TIMEOUT_MINUTES);

    const transaction = await this.prisma.transaction.create({
      data: {
        commerceId: commerce.id,
        status: 'PENDING',
        totalAmount,
        paymentMethod: dto.paymentMethod ? mirrorEnum<PrismaPaymentMethod>(dto.paymentMethod) : undefined,
        qrToken,
        qrExpiresAt,
        items: {
          create: items.map((item) => ({
            productId: item.productId ?? null,
            ean: item.ean ?? null,
            plu: item.plu ?? null,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
    });

    return {
      transactionId: transaction.id,
      qrToken,
      qrExpiresAt,
      totalAmount,
    };
  }

  // §13.1 pasos 6-9. La verificación del QR (existencia → PENDING → no expirado,
  // §6.6/§17.4) vive en QrService, compartida con Coupons y Rewards.
  async confirmSale(userAuthId: string, dto: ConfirmSaleDto): Promise<TicketResult> {
    const transaction = await this.qrService.validateTransactionQr(dto.qrToken);

    // El cliente debe estar ya registrado en LocalNow (§13.1: "si está registrado") —
    // si no lo está, simplemente no puede escanear y la venta acabará en ANONYMOUS
    // por el cron de abajo. No autoprovisionamos aquí como sí hace el login.
    const user = await this.prisma.user.findUnique({ where: { authId: userAuthId } });
    if (!user) {
      throw new BadRequestException('Regístrate en LocalNow antes de escanear un ticket');
    }

    const commerce = await this.prisma.commerce.findUnique({
      where: { id: transaction.commerceId },
      include: { city: true, pointsConfig: true },
    });
    if (!commerce) {
      // No debería pasar nunca: la FK de Transaction.commerceId lo garantiza.
      throw new InternalServerErrorException('El comercio de esta transacción no existe');
    }

    const totalAmount = Number(transaction.totalAmount);
    const pointsRatioGlobal = Number(commerce.city.pointsRatioGlobal);
    const commercePointsRatio = commerce.pointsConfig ? Number(commerce.pointsConfig.pointsRatio) : 0;

    const confirmed = await this.prisma.$transaction(async (tx) => {
      const { pointsGlobalEarned, pointsCommerceEarned } = await this.pointsService.creditPurchasePoints(tx, {
        userId: user.id,
        commerceId: commerce.id,
        totalAmount,
        pointsRatioGlobal,
        commercePointsRatio,
      });

      return tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'CONFIRMED',
          userId: user.id,
          pointsGlobalEarned,
          pointsCommerceEarned,
        },
        include: { items: true },
      });
    });

    return this.toTicketResult(confirmed, commerce);
  }

  async getUserTickets(userAuthId: string): Promise<TicketSummaryResult[]> {
    const user = await this.prisma.user.findUnique({ where: { authId: userAuthId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { userId: user.id },
      include: { commerce: { select: { name: true, slug: true } } },
      orderBy: { timestamp: 'desc' },
    });
    return transactions.map((transaction) => this.toTicketSummaryResult(transaction, transaction.commerce));
  }

  async getUserTicket(userAuthId: string, id: string): Promise<TicketResult> {
    const user = await this.prisma.user.findUnique({ where: { authId: userAuthId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { items: true, commerce: { select: { name: true, slug: true } } },
    });
    // Mismo 404 si no existe o si no es tuyo: un ticket es un dato financiero
    // privado, no se distingue "no existe" de "no es tuyo".
    if (!transaction || transaction.userId !== user.id) {
      throw new NotFoundException('Ticket no encontrado');
    }

    return this.toTicketResult(transaction, transaction.commerce);
  }

  // GET /panel/dashboard (§12) — no exige commerce.active: un comercio pendiente de
  // aprobación puede ver su panel (vacío), solo tiene bloqueada la creación de
  // ventas (ver createSale).
  async getPanelDashboard(commerceAuthId: string): Promise<PanelDashboardResult> {
    const commerce = await this.assertCommerce(commerceAuthId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayAgg, recent] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { commerceId: commerce.id, status: { in: ['CONFIRMED', 'ANONYMOUS'] }, timestamp: { gte: startOfDay } },
        _count: { _all: true },
        _sum: { totalAmount: true, pointsGlobalEarned: true },
      }),
      this.prisma.transaction.findMany({
        where: { commerceId: commerce.id, status: { in: ['CONFIRMED', 'ANONYMOUS'] } },
        orderBy: { timestamp: 'desc' },
        take: 5,
      }),
    ]);

    return {
      today: {
        salesCount: todayAgg._count._all,
        totalAmount: Number(todayAgg._sum.totalAmount ?? 0),
        pointsGlobalIssued: todayAgg._sum.pointsGlobalEarned ?? 0,
      },
      recentSales: recent.map(
        (transaction): CommerceSaleSummaryResult => ({
          id: transaction.id,
          timestamp: transaction.timestamp,
          totalAmount: Number(transaction.totalAmount),
          pointsGlobalEarned: transaction.pointsGlobalEarned,
          status: mirrorEnum<TransactionStatus>(transaction.status),
        }),
      ),
    };
  }

  // §13.1 paso 13: si nadie escanea en 5 minutos, la venta queda anónima pero los
  // datos de venta se conservan (solo se pierde el vínculo con un usuario).
  @Cron(CronExpression.EVERY_MINUTE)
  async anonymizeExpiredSales(): Promise<void> {
    await this.prisma.transaction.updateMany({
      where: { status: 'PENDING', qrExpiresAt: { lt: new Date() } },
      data: { status: 'ANONYMOUS' },
    });
  }

  private toTicketResult(
    transaction: TransactionWithItems,
    commerce: { name: string; slug: string },
  ): TicketResult {
    return {
      ...this.toTicketSummaryResult(transaction, commerce),
      items: transaction.items.map((item): TicketItemResult => ({
        productId: item.productId,
        ean: item.ean,
        plu: item.plu,
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    };
  }

  // commerceName/commerceSlug se pasan ya resueltos (no se vuelven a consultar aquí)
  // para no obligar a cada llamador a decidir cómo obtener el comercio — confirmSale
  // ya lo tiene en memoria, getUserTickets/getUserTicket lo traen con un include.
  private toTicketSummaryResult(
    transaction: PrismaTransaction,
    commerce: { name: string; slug: string },
  ): TicketSummaryResult {
    return {
      id: transaction.id,
      commerceId: transaction.commerceId,
      commerceName: commerce.name,
      commerceSlug: commerce.slug,
      status: mirrorEnum<TransactionStatus>(transaction.status),
      timestamp: transaction.timestamp,
      totalAmount: Number(transaction.totalAmount),
      paymentMethod: transaction.paymentMethod ? mirrorEnum<PaymentMethod>(transaction.paymentMethod) : null,
      pointsGlobalEarned: transaction.pointsGlobalEarned,
      pointsCommerceEarned: transaction.pointsCommerceEarned,
    };
  }

  private async assertCommerce(commerceAuthId: string) {
    const commerce = await this.prisma.commerce.findUnique({ where: { authId: commerceAuthId } });
    if (!commerce) {
      throw new ForbiddenException('Esta cuenta no está registrada como comercio');
    }
    return commerce;
  }
}
