import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface GenerarIaJobData {
  centroSlug: string;
  residenteId: string;
  usuarioId: string;
}

@Processor('pai')
export class PaiProcessor {
  private readonly logger = new Logger(PaiProcessor.name);

  constructor(private readonly dataSource: DataSource) {}

  @Process('generar-ia')
  async generarIa(job: Job<GenerarIaJobData>): Promise<Record<string, unknown>> {
    const { centroSlug, residenteId, usuarioId } = job.data;

    this.logger.log(
      `Procesando generación IA de PAI para residente ${residenteId} (centro: ${centroSlug})`,
    );

    try {
      // Llamar al microservicio IA
      const respuesta = await fetch('http://localhost:3002/agentes/pai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centro_slug: centroSlug,
          residente_id: residenteId,
        }),
      });

      if (!respuesta.ok) {
        const detalle = await respuesta.text().catch(() => 'Sin detalle');
        throw new Error(
          `Servicio IA devolvió error ${respuesta.status}: ${detalle}`,
        );
      }

      const borrador = (await respuesta.json()) as Record<string, unknown>;

      // Calcular siguiente versión
      const [ultima] = await this.dataSource.query<Array<{ max: number | null }>>(
        `SELECT MAX(version) AS max FROM pai WHERE residente_id = $1`,
        [residenteId],
      );
      const siguienteVersion = (ultima?.max ?? 0) + 1;

      // Guardar borrador en la BD
      const [pai] = await this.dataSource.query<Array<{ id: string; version: number }>>(
        `INSERT INTO pai
           (residente_id, version, estado, contenido, borrador_ia, created_by, created_at, updated_at)
         VALUES
           ($1, $2, 'borrador', $3, true, $4, NOW(), NOW())
         RETURNING id, version`,
        [
          residenteId,
          siguienteVersion,
          JSON.stringify(borrador),
          usuarioId,
        ],
      );

      this.logger.log(
        `PAI generado por IA: ${pai.id} versión ${pai.version} (centro: ${centroSlug})`,
      );

      return { paiId: pai.id, version: pai.version, ...borrador };
    } catch (error) {
      this.logger.error(
        `Error en generación IA de PAI para residente ${residenteId}: ${String(error)}`,
      );
      throw error;
    }
  }
}
