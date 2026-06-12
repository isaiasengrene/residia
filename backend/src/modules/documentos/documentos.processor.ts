import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DocumentosService, IncidenciaPdf, PaiPdf, ResidentePdf } from './documentos.service';

interface GenerarPdfIncidenciaJobData {
  centroSlug: string;
  incidenciaId: string;
  usuarioId: string;
}

interface GenerarPdfPaiJobData {
  centroSlug: string;
  paiId: string;
  usuarioId: string;
}

@Processor('documentos')
export class DocumentosProcessor {
  private readonly logger = new Logger(DocumentosProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly documentosService: DocumentosService,
  ) {}

  @Process('generar-pdf-incidencia')
  async generarPdfIncidencia(
    job: Job<GenerarPdfIncidenciaJobData>,
  ): Promise<{ jobId: string | number; size: number }> {
    const { centroSlug, incidenciaId } = job.data;

    this.logger.log(
      `Generando PDF de incidencia ${incidenciaId} (centro: ${centroSlug})`,
    );

    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [incidencia] = await this.dataSource.query<IncidenciaPdf[]>(
      `SELECT id, tipo, descripcion, area, prioridad, informa, origen, estado, created_at, closed_at
       FROM incidencias WHERE id = $1`,
      [incidenciaId],
    );

    if (!incidencia) {
      throw new Error(`Incidencia ${incidenciaId} no encontrada`);
    }

    const [residente] = await this.dataSource.query<ResidentePdf[]>(
      `SELECT id, nombre, apellidos, habitacion FROM residentes WHERE id = $1`,
      [incidencia],
    );

    const buffer = await this.documentosService.generarPdfIncidencia(
      incidencia,
      residente ?? { id: '', nombre: 'Desconocido', apellidos: '', habitacion: null },
      centroSlug,
    );

    this.logger.log(
      `PDF de incidencia ${incidenciaId} generado (${buffer.length} bytes)`,
    );

    return { jobId: job.id, size: buffer.length };
  }

  @Process('generar-pdf-pai')
  async generarPdfPai(
    job: Job<GenerarPdfPaiJobData>,
  ): Promise<{ jobId: string | number; size: number }> {
    const { centroSlug, paiId } = job.data;

    this.logger.log(`Generando PDF de PAI ${paiId} (centro: ${centroSlug})`);

    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [pai] = await this.dataSource.query<PaiPdf[]>(
      `SELECT id, version, estado, contenido, aprobado_por, aprobado_en, created_at
       FROM pai WHERE id = $1`,
      [paiId],
    );

    if (!pai) {
      throw new Error(`PAI ${paiId} no encontrado`);
    }

    const residenteIdRow = await this.dataSource.query<Array<{ residente_id: string }>>(
      `SELECT residente_id FROM pai WHERE id = $1`,
      [paiId],
    );

    const residenteId = residenteIdRow[0]?.residente_id;
    let residente: ResidentePdf = { id: '', nombre: 'Desconocido', apellidos: '', habitacion: null };

    if (residenteId) {
      const [r] = await this.dataSource.query<ResidentePdf[]>(
        `SELECT id, nombre, apellidos, habitacion FROM residentes WHERE id = $1`,
        [residenteId],
      );
      if (r) residente = r;
    }

    const buffer = await this.documentosService.generarPdfPai(pai, residente, centroSlug);

    this.logger.log(`PDF de PAI ${paiId} generado (${buffer.length} bytes)`);

    return { jobId: job.id, size: buffer.length };
  }
}
