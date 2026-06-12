import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AuditService } from '../../common/audit.service';
import { CrearPaiDto } from './dto/crear-pai.dto';

export interface Pai {
  id: string;
  residente_id: string;
  version: number;
  estado: 'borrador' | 'revision' | 'aprobado' | 'archivado';
  contenido: Record<string, unknown>;
  borrador_ia: boolean;
  aprobado_por: string | null;
  aprobado_en: string | null;
  proxima_revision: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PaiService {
  private readonly logger = new Logger(PaiService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
    @InjectQueue('pai') private readonly paiQueue: Queue,
  ) {}

  async listar(centroSlug: string, residenteId?: string): Promise<Pai[]> {
    const query = residenteId
      ? `SELECT * FROM pai WHERE residente_id = $1 ORDER BY version DESC`
      : `SELECT * FROM pai ORDER BY created_at DESC`;
    const params = residenteId ? [residenteId] : [];

    const resultado = await this.dataSource.query<Pai[]>(query, params);

    this.logger.debug(
      `PAI listados: ${resultado.length} registros (centro: ${centroSlug})`,
    );
    return resultado;
  }

  async obtener(centroSlug: string, id: string): Promise<Pai> {
    const [pai] = await this.dataSource.query<Pai[]>(
      `SELECT * FROM pai WHERE id = $1`,
      [id],
    );

    if (!pai) {
      throw new NotFoundException(`PAI con id ${id} no encontrado`);
    }

    this.logger.debug(`PAI obtenido: ${id} (centro: ${centroSlug})`);
    return pai;
  }

  async crearBorrador(
    centroSlug: string,
    dto: CrearPaiDto,
    usuarioId: string,
    ip?: string,
  ): Promise<Pai> {
    // Calcular la siguiente versión
    const [ultima] = await this.dataSource.query<Array<{ max: number | null }>>(
      `SELECT MAX(version) AS max FROM pai WHERE residente_id = $1`,
      [dto.residenteId],
    );
    const siguienteVersion = (ultima?.max ?? 0) + 1;

    const [pai] = await this.dataSource.query<Pai[]>(
      `INSERT INTO pai
         (residente_id, version, estado, contenido, borrador_ia, proxima_revision, created_by, created_at, updated_at)
       VALUES
         ($1, $2, 'borrador', $3, false, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        dto.residenteId,
        siguienteVersion,
        JSON.stringify(dto.contenido),
        dto.proximaRevision ?? null,
        usuarioId,
      ],
    );

    await this.auditService.registrar({
      accion: 'CREATE',
      usuario_id: usuarioId,
      recurso_tipo: 'pai',
      recurso_id: pai.id,
      payload: { version: pai.version, residente_id: dto.residenteId },
      ip_origen: ip,
    });

    this.logger.log(
      `PAI creado: ${pai.id} versión ${pai.version} (centro: ${centroSlug})`,
    );
    return pai;
  }

  async generarBorradorIA(
    centroSlug: string,
    residenteId: string,
    usuarioId: string,
    ip?: string,
  ): Promise<{ jobId: string; estado: string; mensaje: string }> {
    const job = await this.paiQueue.add('generar-ia', {
      centroSlug,
      residenteId,
      usuarioId,
    });

    await this.auditService.registrar({
      accion: 'GENERATE_IA',
      usuario_id: usuarioId,
      recurso_tipo: 'pai',
      recurso_id: residenteId,
      payload: { residente_id: residenteId, job_id: String(job.id) },
      ip_origen: ip,
    });

    this.logger.log(
      `Generación IA de PAI encolada: job ${job.id} para residente ${residenteId} (centro: ${centroSlug})`,
    );

    return {
      jobId: String(job.id),
      estado: 'en_proceso',
      mensaje:
        'El borrador se está generando. Recibirá una notificación cuando esté listo.',
    };
  }

  async aprobar(
    centroSlug: string,
    id: string,
    usuarioId: string,
    ip?: string,
  ): Promise<Pai> {
    const [pai] = await this.dataSource.query<Pai[]>(
      `UPDATE pai
       SET estado = 'aprobado', aprobado_por = $1, aprobado_en = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [usuarioId, id],
    );

    if (!pai) {
      throw new NotFoundException(`PAI con id ${id} no encontrado`);
    }

    await this.auditService.registrar({
      accion: 'APPROVE',
      usuario_id: usuarioId,
      recurso_tipo: 'pai',
      recurso_id: id,
      payload: { estado: 'aprobado', residente_id: pai.residente_id },
      ip_origen: ip,
    });

    this.logger.log(`PAI aprobado: ${id} (centro: ${centroSlug})`);
    return pai;
  }

  async archivar(
    centroSlug: string,
    id: string,
    usuarioId: string,
    ip?: string,
  ): Promise<Pai> {
    const [pai] = await this.dataSource.query<Pai[]>(
      `UPDATE pai
       SET estado = 'archivado', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (!pai) {
      throw new NotFoundException(`PAI con id ${id} no encontrado`);
    }

    await this.auditService.registrar({
      accion: 'ARCHIVE',
      usuario_id: usuarioId,
      recurso_tipo: 'pai',
      recurso_id: id,
      payload: { estado: 'archivado', residente_id: pai.residente_id },
      ip_origen: ip,
    });

    this.logger.log(`PAI archivado: ${id} (centro: ${centroSlug})`);
    return pai;
  }

  async actualizarContenido(
    centroSlug: string,
    id: string,
    contenido: Record<string, unknown>,
    usuarioId: string,
    ip?: string,
  ): Promise<Pai> {
    const [pai] = await this.dataSource.query<Pai[]>(
      `UPDATE pai
       SET contenido = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(contenido), id],
    );

    if (!pai) {
      throw new NotFoundException(`PAI con id ${id} no encontrado`);
    }

    await this.auditService.registrar({
      accion: 'UPDATE_CONTENIDO',
      usuario_id: usuarioId,
      recurso_tipo: 'pai',
      recurso_id: id,
      payload: { residente_id: pai.residente_id },
      ip_origen: ip,
    });

    this.logger.log(`Contenido PAI actualizado: ${id} (centro: ${centroSlug})`);
    return pai;
  }
}
