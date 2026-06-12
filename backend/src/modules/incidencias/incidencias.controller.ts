import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import {
  IncidenciasService,
  CrearIncidenciaDto,
  FiltrosIncidencia,
} from './incidencias.service';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

@Controller('incidencias')
@UseGuards(RbacGuard)
export class IncidenciasController {
  private readonly logger = new Logger(IncidenciasController.name);

  constructor(private readonly incidenciasService: IncidenciasService) {}

  /**
   * GET /incidencias
   * Lista incidencias con filtros opcionales: prioridad, estado, fecha.
   */
  @Get()
  listar(@Query() filtros: FiltrosIncidencia) {
    return this.incidenciasService.listar(filtros);
  }

  /**
   * GET /incidencias/exportar
   * Exporta todas las incidencias en formato JSON para inspección.
   * Debe estar antes de /:id para evitar colisión de rutas.
   */
  @Get('exportar')
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.INSPECTOR,
    PerfilUsuario.SUPERADMIN,
  )
  exportar() {
    return this.incidenciasService.exportarParaInspeccion();
  }

  /**
   * GET /incidencias/:id
   * Obtiene el detalle de una incidencia con su traza de auditoría.
   */
  @Get(':id')
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidenciasService.obtenerConTraza(id);
  }

  /**
   * POST /incidencias
   * Crea una nueva incidencia. Disponible para todos los perfiles clínicos.
   */
  @Post()
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.SANITARIO,
    PerfilUsuario.AUXILIAR,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  crear(@Body() dto: CrearIncidenciaDto, @Req() req: RequestConTenant) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.incidenciasService.crear(dto, req.usuarioId!, ip);
  }

  /**
   * PATCH /incidencias/:id/cerrar
   * Cierra una incidencia abierta.
   */
  @Patch(':id/cerrar')
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.SANITARIO,
  )
  cerrar(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestConTenant) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.incidenciasService.cerrar(id, req.usuarioId!, ip);
  }
}
