import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService, WhatsappWebhookPayload } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * GET /whatsapp/webhook
   * Endpoint de verificación de Meta — requerido para registrar el webhook.
   */
  @Get('webhook')
  verificar(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ): void {
    const resultado = this.whatsappService.verificar(mode, token, challenge);

    if (resultado === null) {
      throw new ForbiddenException('Token de verificación incorrecto');
    }

    // Meta espera la respuesta con hub.challenge como texto plano y código 200
    res.status(HttpStatus.OK).send(resultado);
  }

  /**
   * POST /whatsapp/webhook
   * Recibe mensajes entrantes de WhatsApp Business API.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async recibirMensaje(@Body() payload: WhatsappWebhookPayload): Promise<{ status: string }> {
    // Responder inmediatamente con 200 (Meta requiere respuesta rápida)
    // El procesamiento real ocurre de forma asíncrona
    void this.whatsappService.procesarMensaje(payload);
    return { status: 'ok' };
  }
}
