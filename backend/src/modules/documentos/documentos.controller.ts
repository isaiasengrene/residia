import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentosService, IncidenciaPdf, PaiPdf, ResidentePdf } from './documentos.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RequestConTenant } from '../../common/tenant.middleware';
import { DataSource } from 'typeorm';

@Controller('documentos')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * GET /documentos/incidencia/:id/pdf
   * Genera y sirve el PDF de una incidencia como respuesta inline.
   */
  @Get('incidencia/:id/pdf')
  async pdfIncidencia(
    @Param('id') id: string,
    @Req() req: RequestConTenant,
    @Res() res: Response,
  ): Promise<void> {
    const centroSlug = req.centroSlug!;
    const schemaName = `centro_${centroSlug}`;

    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [incidencia] = await this.dataSource.query<IncidenciaPdf[]>(
      `SELECT id, tipo, descripcion, area, prioridad, informa, origen, estado, created_at, closed_at
       FROM incidencias WHERE id = $1`,
      [id],
    );

    if (!incidencia) {
      throw new NotFoundException(`Incidencia con ID "${id}" no encontrada`);
    }

    let residente: ResidentePdf = {
      id: '',
      nombre: 'Residente',
      apellidos: '',
      habitacion: null,
    };

    // Intentar obtener residente si está asociado
    const incidenciaConResidente = incidencia as IncidenciaPdf & { residente_id?: string };
    if (incidenciaConResidente.residente_id) {
      const [r] = await this.dataSource.query<ResidentePdf[]>(
        `SELECT id, nombre, apellidos, habitacion FROM residentes WHERE id = $1`,
        [incidenciaConResidente.residente_id],
      );
      if (r) residente = r;
    }

    const buffer = await this.documentosService.generarPdfIncidencia(
      incidencia,
      residente,
      centroSlug,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="incidencia-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  /**
   * GET /documentos/pai/:id/pdf
   * Genera y sirve el PDF de un PAI como respuesta inline.
   */
  @Get('pai/:id/pdf')
  async pdfPai(
    @Param('id') id: string,
    @Req() req: RequestConTenant,
    @Res() res: Response,
  ): Promise<void> {
    const centroSlug = req.centroSlug!;
    const schemaName = `centro_${centroSlug}`;

    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [pai] = await this.dataSource.query<PaiPdf[]>(
      `SELECT id, version, estado, contenido, aprobado_por, aprobado_en, created_at
       FROM pai WHERE id = $1`,
      [id],
    );

    if (!pai) {
      throw new NotFoundException(`PAI con ID "${id}" no encontrado`);
    }

    const [residenteRow] = await this.dataSource.query<Array<{ residente_id: string }>>(
      `SELECT residente_id FROM pai WHERE id = $1`,
      [id],
    );

    let residente: ResidentePdf = {
      id: '',
      nombre: 'Residente',
      apellidos: '',
      habitacion: null,
    };

    if (residenteRow?.residente_id) {
      const [r] = await this.dataSource.query<ResidentePdf[]>(
        `SELECT id, nombre, apellidos, habitacion FROM residentes WHERE id = $1`,
        [residenteRow.residente_id],
      );
      if (r) residente = r;
    }

    const buffer = await this.documentosService.generarPdfPai(pai, residente, centroSlug);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="pai-${id}-v${pai.version}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
