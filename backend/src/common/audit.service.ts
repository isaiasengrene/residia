import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';

export interface ParametrosAuditoria {
  accion: string;
  usuario_id: string;
  recurso_tipo: string;
  recurso_id: string;
  payload: Record<string, unknown>;
  ip_origen?: string;
}

/**
 * AuditService — Registro de auditoría con cadena de hashes.
 * Cada registro incorpora el hash del registro anterior, garantizando
 * la integridad de la cadena (blockchain-style).
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Registra una acción en el audit_log del tenant actual.
   * El search_path ya está establecido por el TenantMiddleware.
   */
  async registrar(params: ParametrosAuditoria): Promise<void> {
    const {
      accion,
      usuario_id,
      recurso_tipo,
      recurso_id,
      payload,
      ip_origen,
    } = params;

    try {
      // Obtener el hash del último registro para encadenar
      const [ultimoRegistro] = await this.dataSource.query<
        Array<{ hash_propio: string | null }>
      >(
        `SELECT hash_propio FROM audit_log ORDER BY id DESC LIMIT 1`,
      );

      const hashAnterior = ultimoRegistro?.hash_propio ?? null;
      const timestampUtc = new Date().toISOString();

      // Calcular el hash propio: SHA256(hash_anterior + payload_json + timestamp)
      const contenidoHash = [
        hashAnterior ?? '',
        JSON.stringify(payload),
        timestampUtc,
      ].join('|');

      const hashPropio = crypto
        .createHash('sha256')
        .update(contenidoHash, 'utf8')
        .digest('hex');

      await this.dataSource.query(
        `INSERT INTO audit_log
           (hash_anterior, hash_propio, timestamp_utc, accion, usuario_id,
            recurso_tipo, recurso_id, payload, ip_origen)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::inet)`,
        [
          hashAnterior,
          hashPropio,
          timestampUtc,
          accion,
          usuario_id,
          recurso_tipo,
          recurso_id,
          JSON.stringify(payload),
          ip_origen ?? null,
        ],
      );

      this.logger.debug(
        `Auditoría registrada — acción: ${accion}, recurso: ${recurso_tipo}/${recurso_id}`,
      );
    } catch (error) {
      // El fallo de auditoría no debe interrumpir la operación principal,
      // pero sí debe quedar registrado en los logs del sistema.
      this.logger.error(
        `Error al registrar auditoría para la acción "${accion}": ${String(error)}`,
      );
    }
  }

  /**
   * Verifica la integridad de la cadena de hashes del audit_log.
   * Recorre todos los registros y valida que cada hash sea correcto.
   */
  async verificarIntegridad(): Promise<{
    integra: boolean;
    registros: number;
    ultimoHash: string | null;
    primerErrorId?: number;
  }> {
    const registros = await this.dataSource.query<
      Array<{
        id: number;
        hash_anterior: string | null;
        hash_propio: string;
        timestamp_utc: string;
        payload: Record<string, unknown>;
      }>
    >(`SELECT id, hash_anterior, hash_propio, timestamp_utc, payload
       FROM audit_log
       ORDER BY id ASC`);

    if (registros.length === 0) {
      return { integra: true, registros: 0, ultimoHash: null };
    }

    for (const registro of registros) {
      const contenidoEsperado = [
        registro.hash_anterior ?? '',
        JSON.stringify(registro.payload),
        registro.timestamp_utc,
      ].join('|');

      const hashEsperado = crypto
        .createHash('sha256')
        .update(contenidoEsperado, 'utf8')
        .digest('hex');

      if (hashEsperado !== registro.hash_propio) {
        this.logger.warn(
          `Integridad comprometida en el registro de auditoría ID: ${registro.id}`,
        );
        return {
          integra: false,
          registros: registros.length,
          ultimoHash: registros[registros.length - 1]?.hash_propio ?? null,
          primerErrorId: registro.id,
        };
      }
    }

    return {
      integra: true,
      registros: registros.length,
      ultimoHash: registros[registros.length - 1]?.hash_propio ?? null,
    };
  }
}
