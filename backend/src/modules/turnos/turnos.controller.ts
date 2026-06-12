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
import { TurnosService } from './turnos.service';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { CerrarTurnoDto } from './dto/cerrar-turno.dto';
import { TraspasoTurnoDto } from './dto/traspasar-turno.dto';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

@Controller('turnos')
@UseGuards(RbacGuard)
export class TurnosController {
  private readonly logger = new Logger(TurnosController.name);

  constructor(private readonly turnosService: TurnosService) {}

  /**
   * GET /turnos/actual
   * Devuelve el turno activo del usuario autenticado.
   * Debe estar antes de /:id para evitar colisión de rutas.
   */
  @Get('actual')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.AUXILIAR,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
  )
  turnoActual(@Req() req: RequestConTenant) {
    return this.turnosService.turnoActual(req.centroSlug!, req.usuarioId!);
  }

  /**
   * GET /turnos?fecha=YYYY-MM-DD
   * Lista los turnos de una fecha concreta (por defecto hoy).
   */
  @Get()
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.AUXILIAR,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
  )
  listar(@Query('fecha') fecha: string | undefined, @Req() req: RequestConTenant) {
    return this.turnosService.listar(req.centroSlug!, fecha);
  }

  /**
   * POST /turnos
   * Inicia un nuevo turno para el profesional autenticado.
   */
  @Post()
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.AUXILIAR,
    PerfilUsuario.COORDINADOR,
  )
  iniciar(@Body() dto: IniciarTurnoDto, @Req() req: RequestConTenant) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.turnosService.iniciar(req.centroSlug!, dto, req.usuarioId!, ip);
  }

  /**
   * PATCH /turnos/:id/cerrar
   * Cierra un turno activo con notas opcionales y hash de firma.
   */
  @Patch(':id/cerrar')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.AUXILIAR,
    PerfilUsuario.COORDINADOR,
  )
  cerrar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CerrarTurnoDto,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.turnosService.cerrar(req.centroSlug!, id, dto, req.usuarioId!, ip);
  }

  /**
   * POST /turnos/:id/traspasar
   * Marca el turno como traspasado con un resumen del traspaso.
   */
  @Post(':id/traspasar')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.AUXILIAR,
    PerfilUsuario.COORDINADOR,
  )
  traspasar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TraspasoTurnoDto,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.turnosService.traspasar(req.centroSlug!, id, dto, req.usuarioId!, ip);
  }
}
