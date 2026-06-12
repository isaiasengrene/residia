import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { ModelosIaService } from './modelos-ia.service';
import { CrearModeloIaDto } from './dto/crear-modelo-ia.dto';

@Controller('admin/modelos-ia')
@UseGuards(RbacGuard)
@Roles(PerfilUsuario.SUPERADMIN)
export class ModelosIaController {
  private readonly logger = new Logger(ModelosIaController.name);

  constructor(private readonly modelosIaService: ModelosIaService) {}

  /**
   * GET /admin/modelos-ia
   * Lista todos los modelos IA (sin API keys).
   */
  @Get()
  async listar() {
    const modelos = await this.modelosIaService.listar();
    return { total: (modelos as unknown[]).length, modelos };
  }

  /**
   * POST /admin/modelos-ia
   * Crea un nuevo modelo IA.
   */
  @Post()
  async crear(@Body() dto: CrearModeloIaDto) {
    return this.modelosIaService.crear(dto);
  }

  /**
   * GET /admin/modelos-ia/configuracion-activa
   * Devuelve la configuración activa por agente (con API keys descifradas).
   * Uso exclusivo del servicio IA interno.
   */
  @Get('configuracion-activa')
  async configuracionActiva() {
    return this.modelosIaService.obtenerConfiguracionActiva();
  }

  /**
   * PATCH /admin/modelos-ia/:id/activar
   * Activa un modelo y desactiva los demás del mismo agente.
   */
  @Patch(':id/activar')
  async activar(@Param('id') id: string) {
    return this.modelosIaService.activar(id);
  }

  /**
   * PATCH /admin/modelos-ia/:id/desactivar
   * Desactiva un modelo.
   */
  @Patch(':id/desactivar')
  async desactivar(@Param('id') id: string) {
    return this.modelosIaService.desactivar(id);
  }

  /**
   * DELETE /admin/modelos-ia/:id
   * Elimina un modelo (solo si está inactivo).
   */
  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.modelosIaService.eliminar(id);
  }
}
