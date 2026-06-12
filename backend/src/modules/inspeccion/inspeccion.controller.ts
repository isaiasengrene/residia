import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InspeccionService } from './inspeccion.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles } from '../../common/roles.decorator';
import { PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

interface GenerarCredencialDto {
  horas: number;
  ambito?: string;
}

interface ValidarCredencialDto {
  codigo: string;
  centroSlug: string;
}

@Controller('inspeccion')
export class InspeccionController {
  constructor(private readonly inspeccionService: InspeccionService) {}

  /**
   * POST /inspeccion/credencial
   * Genera una credencial temporal de acceso para inspector.
   */
  @Post('credencial')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Roles(PerfilUsuario.ADMIN_CENTRO, PerfilUsuario.COORDINADOR)
  @HttpCode(HttpStatus.CREATED)
  async generarCredencial(
    @Req() req: RequestConTenant,
    @Body() body: GenerarCredencialDto,
  ) {
    const { horas, ambito = 'completo' } = body;

    if (!horas || horas <= 0) {
      throw new BadRequestException('El número de horas de validez es obligatorio y debe ser positivo');
    }

    const ip = req.headers['x-forwarded-for'] as string | undefined
      ?? req.socket?.remoteAddress;

    return this.inspeccionService.generarCredencial(
      req.centroSlug!,
      req.usuarioId!,
      horas,
      ambito,
      ip,
    );
  }

  /**
   * POST /inspeccion/validar
   * Endpoint público — valida código y emite JWT de inspector.
   */
  @Post('validar')
  @HttpCode(HttpStatus.OK)
  async validar(@Req() req: RequestConTenant, @Body() body: ValidarCredencialDto) {
    const { codigo, centroSlug } = body;

    if (!codigo || !centroSlug) {
      throw new BadRequestException('El código y el identificador del centro son obligatorios');
    }

    const ip = req.headers['x-forwarded-for'] as string | undefined
      ?? req.socket?.remoteAddress;

    return this.inspeccionService.validarCredencial(codigo, centroSlug, ip);
  }

  /**
   * GET /inspeccion/exportar
   * Exporta paquete de auditoría en rango de fechas.
   */
  @Get('exportar')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Roles(PerfilUsuario.INSPECTOR, PerfilUsuario.ADMIN_CENTRO)
  async exportar(
    @Req() req: RequestConTenant,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    if (!desde || !hasta) {
      throw new BadRequestException(
        'Los parámetros "desde" y "hasta" son obligatorios (formato ISO 8601)',
      );
    }

    const ip = req.headers['x-forwarded-for'] as string | undefined
      ?? req.socket?.remoteAddress;

    return this.inspeccionService.exportarPaqueteAuditoria(
      req.centroSlug!,
      desde,
      hasta,
      req.usuarioId!,
      ip,
    );
  }

  /**
   * DELETE /inspeccion/credencial/:id
   * Revoca una credencial de inspección.
   */
  @Delete('credencial/:id')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Roles(PerfilUsuario.ADMIN_CENTRO)
  @HttpCode(HttpStatus.NO_CONTENT)
  async revocar(@Req() req: RequestConTenant, @Param('id') id: string) {
    const ip = req.headers['x-forwarded-for'] as string | undefined
      ?? req.socket?.remoteAddress;

    await this.inspeccionService.revocarCredencial(
      id,
      req.centroSlug!,
      req.usuarioId!,
      ip,
    );
  }
}
