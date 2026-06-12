import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

@Controller('expediente')
@UseGuards(RbacGuard)
export class ExpedienteController {
  private readonly logger = new Logger(ExpedienteController.name);

  constructor(private readonly expedienteService: ExpedienteService) {}

  /**
   * GET /expediente/:residenteId
   * Obtiene el expediente completo de un residente.
   */
  @Get(':residenteId')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.INSPECTOR,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  obtener(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Req() req: RequestConTenant,
  ) {
    return this.expedienteService.obtener(req.centroSlug!, residenteId);
  }

  /**
   * GET /expediente/:residenteId/exportar
   * Exporta el expediente completo en JSON estructurado para inspección o PDF.
   * Registra la exportación en el log de auditoría.
   */
  @Get(':residenteId/exportar')
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.INSPECTOR,
    PerfilUsuario.COORDINADOR,
  )
  exportar(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.expedienteService.exportarParaInspeccion(
      req.centroSlug!,
      residenteId,
      req.usuarioId!,
      ip,
    );
  }
}
