import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit.service';

export interface ExpedienteCompleto {
  residente: Record<string, unknown>;
  consentimientos: unknown[];
  incidencias: unknown[];
  turnos: unknown[];
}

@Injectable()
export class ExpedienteService {
  private readonly logger = new Logger(ExpedienteService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Construye el expediente completo de un residente agregando datos
   * de todas las tablas relacionadas. No hay tabla propia de expediente —
   * es una vista unificada generada en tiempo real.
   */
  async obtener(
    centroSlug: string,
    residenteId: string,
  ): Promise<ExpedienteCompleto> {
    // Verificar que el residente existe
    const [residente] = await this.dataSource.query<Record<string, unknown>[]>(
      `SELECT id, nombre, apellidos, fecha_nacimiento, habitacion, activo, created_at
       FROM residentes
       WHERE id = $1`,
      [residenteId],
    );

    if (!residente) {
      throw new NotFoundException(
        `Residente con ID "${residenteId}" no encontrado`,
      );
    }

    // Ejecutar el resto de consultas en paralelo
    const [consentimientos, incidencias, turnos] = await Promise.all([
      this.dataSource.query(
        `SELECT id, residente_id, version, estado, fecha_firma,
                firmante_nombre, firmante_rol, created_at
         FROM consentimientos
         WHERE residente_id = $1
         ORDER BY created_at DESC`,
        [residenteId],
      ),
      this.dataSource.query(
        `SELECT id, tipo, descripcion, area, prioridad, informa,
                origen, estado, accion_requerida, created_at, closed_at
         FROM incidencias
         WHERE residente_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [residenteId],
      ),
      this.dataSource.query(
        `SELECT id, tipo, fecha, inicio, fin, profesional_nombre,
                estado, notas, created_at
         FROM turnos
         ORDER BY inicio DESC
         LIMIT 10`,
      ),
    ]);

    this.logger.debug(
      `Expediente construido para residente ${residenteId} (centro: ${centroSlug})`,
    );

    return {
      residente,
      consentimientos,
      incidencias,
      turnos,
    };
  }

  /**
   * Exporta el expediente completo en formato estructurado JSON
   * para generación de PDF o inspección reglamentaria.
   * Registra la exportación en auditoría.
   */
  async exportarParaInspeccion(
    centroSlug: string,
    residenteId: string,
    usuarioId: string,
    ip?: string,
  ): Promise<{
    exportado_en: string;
    centro_slug: string;
    expediente: ExpedienteCompleto;
  }> {
    const expediente = await this.obtener(centroSlug, residenteId);

    // Obtener historial clínico completo (sin límite para exportación)
    const [incidenciasCompletas, historialAuditoria] = await Promise.all([
      this.dataSource.query(
        `SELECT id, tipo, descripcion, area, prioridad, informa,
                origen, estado, accion_requerida, created_at, closed_at
         FROM incidencias
         WHERE residente_id = $1
         ORDER BY created_at ASC`,
        [residenteId],
      ),
      this.dataSource.query(
        `SELECT timestamp_utc, accion, recurso_tipo, recurso_id
         FROM audit_log
         WHERE recurso_id = $1
         ORDER BY timestamp_utc ASC`,
        [residenteId],
      ),
    ]);

    expediente.incidencias = incidenciasCompletas;

    await this.auditService.registrar({
      accion: 'EXPORT',
      usuario_id: usuarioId,
      recurso_tipo: 'expediente',
      recurso_id: residenteId,
      payload: {
        centro_slug: centroSlug,
        total_incidencias: incidenciasCompletas.length,
        total_consentimientos: expediente.consentimientos.length,
        historial_auditoria_registros: historialAuditoria.length,
      },
      ip_origen: ip,
    });

    this.logger.log(
      `Exportación de expediente para residente ${residenteId} por usuario ${usuarioId}`,
    );

    return {
      exportado_en: new Date().toISOString(),
      centro_slug: centroSlug,
      expediente,
    };
  }
}
