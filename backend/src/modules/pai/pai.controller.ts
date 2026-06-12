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
} from '@nestjs/common';
import { PaiService } from './pai.service';
import { CrearPaiDto } from './dto/crear-pai.dto';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { RequestConTenant } from '../../common/tenant.middleware';

class ActualizarContenidoDto {
  contenido!: Record<string, unknown>;
}

@Controller('pai')
@UseGuards(RbacGuard)
export class PaiController {
  constructor(private readonly paiService: PaiService) {}

  /**
   * GET /pai — listar todos los PAI del centro
   */
  @Get()
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  listar(@Req() req: RequestConTenant) {
    return this.paiService.listar(req.centroSlug!);
  }

  /**
   * GET /pai/residente/:residenteId — PAI de un residente específico
   */
  @Get('residente/:residenteId')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  porResidente(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Req() req: RequestConTenant,
  ) {
    return this.paiService.listar(req.centroSlug!, residenteId);
  }

  /**
   * GET /pai/:id — detalle de un PAI
   */
  @Get(':id')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  obtener(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConTenant,
  ) {
    return this.paiService.obtener(req.centroSlug!, id);
  }

  /**
   * POST /pai — crear borrador manual
   */
  @Post()
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  crear(@Body() dto: CrearPaiDto, @Req() req: RequestConTenant) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.paiService.crearBorrador(
      req.centroSlug!,
      dto,
      req.usuarioId!,
      ip,
    );
  }

  /**
   * POST /pai/generar-ia/:residenteId — encolar generación IA
   */
  @Post('generar-ia/:residenteId')
  @Roles(PerfilUsuario.COORDINADOR, PerfilUsuario.ADMIN_CENTRO)
  generarIA(
    @Param('residenteId', ParseUUIDPipe) residenteId: string,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.paiService.generarBorradorIA(
      req.centroSlug!,
      residenteId,
      req.usuarioId!,
      ip,
    );
  }

  /**
   * PATCH /pai/:id/aprobar — aprobar un PAI
   */
  @Patch(':id/aprobar')
  @Roles(PerfilUsuario.COORDINADOR, PerfilUsuario.ADMIN_CENTRO)
  aprobar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.paiService.aprobar(req.centroSlug!, id, req.usuarioId!, ip);
  }

  /**
   * PATCH /pai/:id/archivar — archivar un PAI
   */
  @Patch(':id/archivar')
  @Roles(PerfilUsuario.COORDINADOR, PerfilUsuario.ADMIN_CENTRO)
  archivar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.paiService.archivar(req.centroSlug!, id, req.usuarioId!, ip);
  }

  /**
   * PATCH /pai/:id/contenido — actualizar contenido de un PAI
   */
  @Patch(':id/contenido')
  @Roles(
    PerfilUsuario.SANITARIO,
    PerfilUsuario.COORDINADOR,
    PerfilUsuario.ADMIN_CENTRO,
    PerfilUsuario.TRABAJADOR_SOCIAL,
  )
  actualizarContenido(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarContenidoDto,
    @Req() req: RequestConTenant,
  ) {
    const ip = req.ip ?? req.socket?.remoteAddress;
    return this.paiService.actualizarContenido(
      req.centroSlug!,
      id,
      body.contenido,
      req.usuarioId!,
      ip,
    );
  }
}
