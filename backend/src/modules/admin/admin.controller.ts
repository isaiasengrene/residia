import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RbacGuard } from '../../common/rbac.guard';
import { Roles, PerfilUsuario } from '../../common/roles.decorator';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

class ProvisionarCentroDto {
  @IsString({ message: 'El nombre del centro debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del centro es obligatorio' })
  nombre!: string;

  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El slug del centro es obligatorio' })
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'El slug solo puede contener letras minúsculas, números y guiones bajos',
  })
  slug!: string;
}

@Controller('admin')
@UseGuards(RbacGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * POST /admin/centros
   * Aprovisiona un nuevo centro: crea el registro en shared.centros
   * y llama a la función provisionar_centro para crear el esquema.
   * Solo SUPERADMIN.
   */
  @Post('centros')
  @Roles(PerfilUsuario.SUPERADMIN)
  async provisionarCentro(@Body() dto: ProvisionarCentroDto) {
    // Verificar que el slug no existe ya
    const [existente] = await this.dataSource.query(
      `SELECT id FROM shared.centros WHERE slug = $1`,
      [dto.slug],
    );

    if (existente) {
      throw new BadRequestException(
        `Ya existe un centro con el slug "${dto.slug}"`,
      );
    }

    // Insertar en el catálogo compartido
    const [nuevoCentro] = await this.dataSource.query(
      `INSERT INTO shared.centros (nombre, slug)
       VALUES ($1, $2)
       RETURNING id, nombre, slug, activo, created_at`,
      [dto.nombre, dto.slug],
    );

    // Aprovisionar el esquema con todas sus tablas
    await this.dataSource.query(
      `SELECT shared.provisionar_centro($1)`,
      [dto.slug],
    );

    this.logger.log(
      `Centro aprovisionado: "${dto.nombre}" (slug: ${dto.slug}, ID: ${nuevoCentro.id})`,
    );

    return {
      mensaje: `Centro "${dto.nombre}" aprovisionado correctamente`,
      centro: nuevoCentro,
    };
  }

  /**
   * GET /admin/centros
   * Lista todos los centros registrados en la plataforma.
   * Solo SUPERADMIN.
   */
  @Get('centros')
  @Roles(PerfilUsuario.SUPERADMIN)
  async listarCentros() {
    const centros = await this.dataSource.query(
      `SELECT id, nombre, slug, activo, created_at
       FROM shared.centros
       ORDER BY nombre`,
    );

    return { total: centros.length, centros };
  }
}
