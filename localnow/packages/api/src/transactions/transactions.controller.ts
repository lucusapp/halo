import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { ConfirmSaleDto } from './dto/confirm-sale.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { TransactionsService } from './transactions.service';
import type { PanelDashboardResult, SaleCreatedResult, TicketResult, TicketSummaryResult } from './types';

// Rutas explícitas por §12 (/panel/sale/new, /user/tickets...) en vez de un único
// prefijo de recurso: no comparten un prefijo común porque el dueño de cada una es
// distinto (el panel del comercio vs. el historial del cliente).
@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('panel/sale/new')
  createSale(@CurrentUser() claims: ClerkJwtClaims, @Body() dto: CreateSaleDto): Promise<SaleCreatedResult> {
    return this.transactionsService.createSale(claims.sub, dto);
  }

  @Get('panel/dashboard')
  getPanelDashboard(@CurrentUser() claims: ClerkJwtClaims): Promise<PanelDashboardResult> {
    return this.transactionsService.getPanelDashboard(claims.sub);
  }

  // No está en el §12 explícitamente (ese documenta /qr/validate para que el
  // COMERCIO valide un QR que le enseña el cliente — el caso inverso de aquí, donde
  // es el CLIENTE quien escanea el QR que muestra el comercio). Se factorizará junto
  // al resto de validación de QR cuando construyamos ese módulo.
  @Post('transactions/confirm-sale')
  confirmSale(@CurrentUser() claims: ClerkJwtClaims, @Body() dto: ConfirmSaleDto): Promise<TicketResult> {
    return this.transactionsService.confirmSale(claims.sub, dto);
  }

  @Get('user/tickets')
  getUserTickets(@CurrentUser() claims: ClerkJwtClaims): Promise<TicketSummaryResult[]> {
    return this.transactionsService.getUserTickets(claims.sub);
  }

  @Get('user/tickets/:id')
  getUserTicket(@CurrentUser() claims: ClerkJwtClaims, @Param('id') id: string): Promise<TicketResult> {
    return this.transactionsService.getUserTicket(claims.sub, id);
  }
}
