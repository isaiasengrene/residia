import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { AgentesService } from './agentes.service';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

class SolicitudRegistroDto {
  mensaje!: string;
  residenteId!: string;
  residenteNombre!: string;
  habitacion!: string;
  profesionalNombre!: string;
  area!: string;
}

class SolicitudComunicacionDto {
  tipo!: string;
  resumen!: string;
  residenteNombre!: string;
  area!: string;
}

@Controller('agentes')
@UseGuards(RbacGuard)
export class AgentesController {
  private readonly logger = new Logger(AgentesController.name);

  constructor(private readonly agentesService: AgentesService) {}

  /**
   * POST /agentes/registro
   * Convierte un mensaje de texto libre en borrador de incidencia estructurada.
   * El profesional debe confirmar el borrador antes de guardarlo definitivamente.
   */
  @Post('registro')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.AUXILIAR,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
  )
  async procesarRegistro(
    @Body() dto: SolicitudRegistroDto,
    @Req() req: RequestConTenant,
  ) {
    this.logger.log(
      `Registro IA solicitado por usuario ${req.usuarioId} (centro: ${req.centroSlug})`,
    );
    return this.agentesService.procesarMensaje({
      mensaje: dto.mensaje,
      centroSlug: req.centroSlug!,
      residenteNombre: dto.residenteNombre,
      habitacion: dto.habitacion,
      profesionalNombre: dto.profesionalNombre,
      area: dto.area,
    });
  }

  /**
   * POST /agentes/comunicacion-familiar
   * Genera borrador de mensaje para el familiar del residente.
   * Requiere aprobación del profesional antes del envío.
   */
  @Post('comunicacion-familiar')
  @Roles(
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.TRABAJADOR_SOCIAL,
    PerfilUsuario.ADMIN_CENTRO,
  )
  async redactarComunicacion(
    @Body() dto: SolicitudComunicacionDto,
    @Req() req: RequestConTenant,
  ) {
    this.logger.log(
      `Comunicación familiar IA solicitada por usuario ${req.usuarioId} (centro: ${req.centroSlug})`,
    );
    return this.agentesService.redactarMensajeFamiliar({
      tipo: dto.tipo,
      resumen: dto.resumen,
      centroSlug: req.centroSlug!,
      residenteNombre: dto.residenteNombre,
      area: dto.area,
    });
  }

  /**
   * POST /agentes/seguimiento/:residenteId
   * Analiza el historial y genera seguimiento inteligente del residente.
   */
  @Post('seguimiento/:residenteId')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
  )
  async analizarSeguimiento(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Req() req: RequestConTenant,
  ) {
    this.logger.log(
      `Seguimiento IA solicitado para residente ${residenteId} (centro: ${req.centroSlug})`,
    );
    return this.agentesService.analizarResidente(req.centroSlug!, residenteId);
  }

  /**
   * POST /agentes/pai/:residenteId
   * Genera borrador de PAI. SIEMPRE requiere revisión del equipo multidisciplinar.
   */
  @Post('pai/:residenteId')
  @Roles(
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
  )
  async generarPai(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Req() req: RequestConTenant,
  ) {
    this.logger.log(
      `Generación PAI IA solicitada para residente ${residenteId} (centro: ${req.centroSlug})`,
    );
    return this.agentesService.generarBorradorPai(req.centroSlug!, residenteId);
  }
}
