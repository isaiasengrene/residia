import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { ResidentesService, CrearResidenteDto, ActualizarResidenteDto } from './residentes.service';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

@Controller('residentes')
@UseGuards(RbacGuard)
export class ResidentesController {
  private readonly logger = new Logger(ResidentesController.name);

  constructor(private readonly residentesService: ResidentesService) {}

  /**
   * GET /residentes
   * Lista todos los residentes activos del centro.
   */
  @Get()
  listar() {
    return this.residentesService.listarActivos();
  }

  /**
   * GET /residentes/:id
   * Obtiene el detalle de un residente por su ID.
   */
  @Get(':id')
  obtener(@Param('id', ParseUUIDPipe) id: string) {
    return this.residentesService.obtenerPorId(id);
  }

  /**
   * POST /residentes
   * Crea un nuevo residente. Solo ADMIN_CENTRO, COORDINADOR y TRABAJADOR_SOCIAL.
   */
  @Post()
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  crear(@Body() dto: CrearResidenteDto, @Req() req: RequestConTenant) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.residentesService.crear(dto, req.usuarioId!, ip);
  }

  /**
   * PATCH /residentes/:id
   * Actualiza los datos de un residente.
   */
  @Patch(':id')
  @Roles(
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.TRABAJADOR_SOCIAL,
    PerfilUsuario.SANITARIO,
  )
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarResidenteDto,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.residentesService.actualizar(id, dto, req.usuarioId!, ip);
  }
}
