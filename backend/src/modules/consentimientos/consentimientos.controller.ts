import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import {
  ConsentimientosService,
  RetirarConsentimientoDto,
} from './consentimientos.service';
import { RegistrarConsentimientoDto } from './dto/registrar-consentimiento.dto';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

@Controller('consentimientos')
@UseGuards(RbacGuard)
export class ConsentimientosController {
  private readonly logger = new Logger(ConsentimientosController.name);

  constructor(private readonly consentimientosService: ConsentimientosService) {}

  /**
   * GET /consentimientos/residente/:residenteId
   * Lista todos los consentimientos de un residente.
   */
  @Get('residente/:residenteId')
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  obtenerPorResidente(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Req() req: RequestConTenant,
  ) {
    return this.consentimientosService.obtenerPorResidente(
      req.centroSlug!,
      residenteId,
    );
  }

  /**
   * POST /consentimientos
   * Registra un nuevo consentimiento informado.
   */
  @Post()
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  registrar(
    @Body() dto: RegistrarConsentimientoDto,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.consentimientosService.registrar(
      req.centroSlug!,
      dto,
      req.usuarioId!,
      ip,
    );
  }

  /**
   * POST /consentimientos/:residenteId/retirar
   * Retira el consentimiento activo de un residente.
   * Solo disponible para ADMIN_CENTRO.
   * Los registros clínicos se conservan según Ley 41/2002.
   */
  @Post(':residenteId/retirar')
  @Roles(PerfilUsuario.ADMIN_CENTRO)
  retirar(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Body() dto: RetirarConsentimientoDto,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.consentimientosService.retirar(
      req.centroSlug!,
      residenteId,
      dto,
      req.usuarioId!,
      ip,
    );
  }
}
