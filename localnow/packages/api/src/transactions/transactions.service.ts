import { randomUUID } from 'node:crypto';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  PaymentMethod as PrismaPaymentMethod,
  Prisma,
  Transaction as PrismaTransaction,
  TransactionItem as PrismaTransactionItem,
} from '@prisma/client';
import { PaymentMethod, TransactionStatus, TRANSACTION_ANONYMOUS_TIMEOUT_MINUTES } from '@localnow/shared';
import { PointsService } from '../points/points.service';
import { PrismaService } from '../prisma/prisma.service';
import { mirrorEnum } from '../prisma/mirror-enum.util';
import { ConfirmSaleDto } from './dto/confirm-sale.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import type { SaleCreatedResult, TicketItemResult, TicketResult, TicketSummaryResult } from './types';

type TransactionWithItems = PrismaTransaction & { items: PrismaTransactionItem[] };

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
  ) {}

  // §13.1 pasos 1-5: el comercio registra la venta y recibe el QR para mostrar en
  // pantalla. El total y las líneas SIEMPRE se calculan aquí — nunca se acepta un
  // total ya sumado del cliente, para que no pueda desincronizarse de los productos.
  async createSale(commerceAuthId: string, dto: CreateSaleDto): Promise<SaleCreatedResult> {
    const commerce = await this.prisma.commerce.findUnique({ where: { authId: commerceAuthId } });
    if (!commerce) {
      throw new ForbiddenException('Esta cuenta no está registrada como comercio');
    }
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

    const qrToken = randomUUID();
    const qrExpiresAt = new Date(Date.now() + TRANSACTION_ANONYMOUS_TIMEOUT_MINUTES * 60_000);

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

  // §13.1 pasos 6-9. Orden de verificación del QR igual que en el resto de la app
  // (§6.6, §17.4): existencia → estado PENDING → no expirado.
  async confirmSale(userAuthId: string, dto: ConfirmSaleDto): Promise<TicketResult> {
    const transaction = await this.prisma.transaction.findUnique({ where: { qrToken: dto.qrToken } });
    if (!transaction) {
      throw new NotFoundException('QR no válido');
    }
    if (transaction.status !== 'PENDING') {
      throw new BadRequestException('Este ticket ya no está disponible para confirmar');
    }
    if (!transaction.qrExpiresAt || transaction.qrExpiresAt < new Date()) {
      throw new BadRequestException('El QR ha caducado');
    }

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

    return this.toTicketResult(confirmed);
  }

  async getUserTickets(userAuthId: string): Promise<TicketSummaryResult[]> {
    const user = await this.prisma.user.findUnique({ where: { authId: userAuthId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
    });
    return transactions.map((transaction) => this.toTicketSummaryResult(transaction));
  }

  async getUserTicket(userAuthId: string, id: string): Promise<TicketResult> {
    const user = await this.prisma.user.findUnique({ where: { authId: userAuthId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const transaction = await this.prisma.transaction.findUnique({ where: { id }, include: { items: true } });
    // Mismo 404 si no existe o si no es tuyo: un ticket es un dato financiero
    // privado, no se distingue "no existe" de "no es tuyo".
    if (!transaction || transaction.userId !== user.id) {
      throw new NotFoundException('Ticket no encontrado');
    }

    return this.toTicketResult(transaction);
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

  private toTicketResult(transaction: TransactionWithItems): TicketResult {
    return {
      ...this.toTicketSummaryResult(transaction),
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

  private toTicketSummaryResult(transaction: PrismaTransaction): TicketSummaryResult {
    return {
      id: transaction.id,
      commerceId: transaction.commerceId,
      status: mirrorEnum<TransactionStatus>(transaction.status),
      timestamp: transaction.timestamp,
      totalAmount: Number(transaction.totalAmount),
      paymentMethod: transaction.paymentMethod ? mirrorEnum<PaymentMethod>(transaction.paymentMethod) : null,
      pointsGlobalEarned: transaction.pointsGlobalEarned,
      pointsCommerceEarned: transaction.pointsCommerceEarned,
    };
  }
}
