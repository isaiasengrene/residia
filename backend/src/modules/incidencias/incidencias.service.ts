import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit.service';

export interface Incidencia {
  id: string;
  residente_id: string | null;
  tipo: string;
  descripcion: string;
  area: string | null;
  prioridad: 'alta' | 'media' | 'baja';
  informa: string | null;
  origen: 'web' | 'whatsapp' | 'voz';
  estado: string;
  accion_requerida: boolean;
  created_at: string;
  closed_at: string | null;
}

export interface CrearIncidenciaDto {
  residente_id?: string;
  tipo: string;
  descripcion: string;
  area?: string;
  prioridad: 'alta' | 'media' | 'baja';
  informa?: string;
  origen: 'web' | 'whatsapp' | 'voz';
  accion_requerida?: boolean;
}

export interface FiltrosIncidencia {
  prioridad?: 'alta' | 'media' | 'baja';
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

@Injectable()
export class IncidenciasService {
  private readonly logger = new Logger(IncidenciasService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Lista incidencias con filtros opcionales.
   */
  async listar(filtros: FiltrosIncidencia = {}): Promise<Incidencia[]> {
    const condiciones: string[] = [];
    const valores: unknown[] = [];
    let contador = 1;

    if (filtros.prioridad) {
      condiciones.push(`prioridad = $${contador++}`);
      valores.push(filtros.prioridad);
    }
    if (filtros.estado) {
      condiciones.push(`estado = $${contador++}`);
      valores.push(filtros.estado);
    }
    if (filtros.fecha_desde) {
      condiciones.push(`created_at >= $${contador++}`);
      valores.push(filtros.fecha_desde);
    }
    if (filtros.fecha_hasta) {
      condiciones.push(`created_at <= $${contador++}`);
      valores.push(filtros.fecha_hasta);
    }

    const clausulaWhere =
      condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const incidencias = await this.dataSource.query<Incidencia[]>(
      `SELECT id, residente_id, tipo, descripcion, area, prioridad, informa,
              origen, estado, accion_requerida, created_at, closed_at
       FROM incidencias
       ${clausulaWhere}
       ORDER BY created_at DESC`,
      valores,
    );

    return incidencias;
  }

  /**
   * Obtiene el detalle completo de una incidencia incluyendo su traza de auditoría.
   */
  async obtenerConTraza(id: string): Promise<{
    incidencia: Incidencia;
    traza: unknown[];
  }> {
    const [incidencia] = await this.dataSource.query<Incidencia[]>(
      `SELECT id, residente_id, tipo, descripcion, area, prioridad, informa,
              origen, estado, accion_requerida, created_at, closed_at
       FROM incidencias
       WHERE id = $1`,
      [id],
    );

    if (!incidencia) {
      throw new NotFoundException(`Incidencia con ID "${id}" no encontrada`);
    }

    // Obtener la traza de auditoría relacionada con esta incidencia
    const traza = await this.dataSource.query(
      `SELECT id, timestamp_utc, accion, usuario_id, payload, ip_origen
       FROM audit_log
       WHERE recurso_tipo = 'incidencia' AND recurso_id = $1
       ORDER BY timestamp_utc ASC`,
      [id],
    );

    return { incidencia, traza };
  }

  /**
   * Crea una nueva incidencia y registra la acción en auditoría.
   */
  async crear(
    dto: CrearIncidenciaDto,
    usuarioId: string,
    ipOrigen?: string,
  ): Promise<Incidencia> {
    const [nuevaIncidencia] = await this.dataSource.query<Incidencia[]>(
      `INSERT INTO incidencias
         (residente_id, tipo, descripcion, area, prioridad, informa, origen, accion_requerida, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, residente_id, tipo, descripcion, area, prioridad, informa,
                 origen, estado, accion_requerida, created_at, closed_at`,
      [
        dto.residente_id ?? null,
        dto.tipo,
        dto.descripcion,
        dto.area ?? null,
        dto.prioridad,
        dto.informa ?? null,
        dto.origen,
        dto.accion_requerida ?? false,
      ],
    );

    // Registro de auditoría obligatorio
    await this.auditService.registrar({
      accion: 'CREAR_INCIDENCIA',
      usuario_id: usuarioId,
      recurso_tipo: 'incidencia',
      recurso_id: nuevaIncidencia.id,
      payload: dto as unknown as Record<string, unknown>,
      ip_origen: ipOrigen,
    });

    this.logger.log(
      `Incidencia creada: ${dto.tipo} (prioridad: ${dto.prioridad}, ID: ${nuevaIncidencia.id})`,
    );

    return nuevaIncidencia;
  }

  /**
   * Cierra una incidencia y registra la acción en auditoría.
   */
  async cerrar(
    id: string,
    usuarioId: string,
    ipOrigen?: string,
  ): Promise<Incidencia> {
    const [incidencia] = await this.dataSource.query<Incidencia[]>(
      `UPDATE incidencias
       SET estado = 'cerrada', closed_at = NOW()
       WHERE id = $1 AND estado != 'cerrada'
       RETURNING id, residente_id, tipo, descripcion, area, prioridad, informa,
                 origen, estado, accion_requerida, created_at, closed_at`,
      [id],
    );

    if (!incidencia) {
      throw new NotFoundException(
        `Incidencia con ID "${id}" no encontrada o ya cerrada`,
      );
    }

    // Registro de auditoría obligatorio
    await this.auditService.registrar({
      accion: 'CERRAR_INCIDENCIA',
      usuario_id: usuarioId,
      recurso_tipo: 'incidencia',
      recurso_id: id,
      payload: { closed_at: incidencia.closed_at },
      ip_origen: ipOrigen,
    });

    this.logger.log(`Incidencia cerrada (ID: ${id})`);
    return incidencia;
  }

  /**
   * Exporta todas las incidencias en formato JSON preparado para inspección.
   */
  async exportarParaInspeccion(): Promise<{
    exportado_en: string;
    total: number;
    incidencias: Incidencia[];
  }> {
    const incidencias = await this.dataSource.query<Incidencia[]>(
      `SELECT id, residente_id, tipo, descripcion, area, prioridad, informa,
              origen, estado, accion_requerida, created_at, closed_at
       FROM incidencias
       ORDER BY created_at DESC`,
    );

    this.logger.log(
      `Exportación para inspección: ${incidencias.length} incidencias`,
    );

    return {
      exportado_en: new Date().toISOString(),
      total: incidencias.length,
      incidencias,
    };
  }
}
