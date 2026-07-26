import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../clerk-auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../clerk-auth/jwt-auth.guard';
import type { ClerkJwtClaims } from '../clerk-auth/types';
import { ValidateQrDto } from './dto/validate-qr.dto';
import { QrService } from './qr.service';
import type { QrValidationResult } from './types';

// Llamada desde la app del COMERCIO al escanear un QR de cupón o recompensa (§12,
// §13.2) — nunca desde el cliente.
@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('validate')
  validate(@CurrentUser() claims: ClerkJwtClaims, @Body() dto: ValidateQrDto): Promise<QrValidationResult> {
    return this.qrService.validateAndRedeem(claims.sub, dto.token);
  }
}
