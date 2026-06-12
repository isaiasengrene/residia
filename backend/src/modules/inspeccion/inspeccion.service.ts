import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit.service';
import * as crypto from 'crypto';

interface CredencialDb {
  id: string;
  codigo: string;
  creado_por: string;
  valido_desde: string;
  valido_hasta: string;
  usado_en: string | null;
  ip_uso: string | null;
  activo: boolean;
  ambito: string;
}

@Injectable()
export class InspeccionService {
  private readonly logger = new Logger(InspeccionService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Genera una credencial temporal de 8 caracteres alfanuméricos en mayúsculas.
   * Máximo 72 horas de validez.
   */
  async generarCredencial(
    centroSlug: string,
    adminId: string,
    horasValidez: number,
    ambito: string,
    ip?: string,
  ): Promise<{ id: string; codigo: string; validoHasta: string }> {
    const horas = Math.min(horasValidez, 72);

    if (horas <= 0) {
      throw new BadRequestException('Las horas de validez deben ser mayores que cero');
    }

    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    // Generar código único de 8 caracteres alfanuméricos en mayúsculas
    const codigo = crypto
      .randomBytes(6)
      .toString('base64')
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8)
      .padEnd(8, 'X');

    const [credencial] = await this.dataSource.query<
      Array<{ id: string; codigo: string; valido_hasta: string }>
    >(
      `INSERT INTO credenciales_inspeccion
         (codigo, creado_por, valido_hasta, ambito, activo)
       VALUES ($1, $2, NOW() + INTERVAL '${horas} hours', $3, true)
       RETURNING id, codigo, valido_hasta`,
      [codigo, adminId, ambito],
    );

    await this.auditService.registrar({
      accion: 'CREATE',
      usuario_id: adminId,
      recurso_tipo: 'credencial_inspeccion',
      recurso_id: credencial.id,
      payload: { codigo, horas_validez: horas, ambito },
      ip_origen: ip,
    });

    this.logger.log(
      `Credencial de inspección generada: ${codigo} (${horas}h, centro: ${centroSlug})`,
    );

    return {
      id: credencial.id,
      codigo: credencial.codigo,
      validoHasta: credencial.valido_hasta,
    };
  }

  /**
   * Valida un código de credencial e emite un JWT de inspector.
   */
  async validarCredencial(
    codigo: string,
    centroSlug: string,
    ip?: string,
  ): Promise<{ token: string; validoHasta: string; ambito: string }> {
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [credencial] = await this.dataSource.query<CredencialDb[]>(
      `SELECT id, codigo, creado_por, valido_desde, valido_hasta,
              usado_en, ip_uso, activo, ambito
       FROM credenciales_inspeccion
       WHERE codigo = $1 AND activo = true AND NOW() < valido_hasta`,
      [codigo],
    );

    if (!credencial) {
      this.logger.warn(
        `Intento de acceso con credencial inválida: ${codigo} (centro: ${centroSlug})`,
      );
      throw new UnauthorizedException(
        'Código de inspección inválido, expirado o ya utilizado',
      );
    }

    // Registrar uso
    await this.dataSource.query(
      `UPDATE credenciales_inspeccion
       SET usado_en = NOW(), ip_uso = $1::inet
       WHERE id = $2`,
      [ip ?? null, credencial.id],
    );

    const payload = {
      sub: credencial.id,
      perfil: 'INSPECTOR',
      scope: 'inspeccion' as const,
      centro_slug: centroSlug,
      ambito: credencial.ambito,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: '72h',
    });

    await this.auditService.registrar({
      accion: 'LOGIN',
      usuario_id: credencial.creado_por,
      recurso_tipo: 'inspeccion',
      recurso_id: credencial.id,
      payload: { codigo, ip_acceso: ip ?? null, ambito: credencial.ambito },
      ip_origen: ip,
    });

    this.logger.log(
      `Acceso de inspector concedido — credencial: ${credencial.id} (centro: ${centroSlug})`,
    );

    return {
      token,
      validoHasta: credencial.valido_hasta,
      ambito: credencial.ambito,
    };
  }

  /**
   * Exporta paquete de auditoría completo: incidencias, audit_log y PAI aprobados.
   */
  async exportarPaqueteAuditoria(
    centroSlug: string,
    desde: string,
    hasta: string,
    adminId: string,
    ip?: string,
  ): Promise<{
    exportado_en: string;
    centro_slug: string;
    periodo: { desde: string; hasta: string };
    incidencias: unknown[];
    audit_log: unknown[];
    pai_aprobados: unknown[];
  }> {
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const incidencias = await this.dataSource.query(
      `SELECT id, residente_id, tipo, descripcion, area, prioridad, informa,
              origen, estado, accion_requerida, created_at, closed_at
       FROM incidencias
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at ASC`,
      [desde, hasta],
    );

    const auditLog = await this.dataSource.query(
      `SELECT id, hash_anterior, hash_propio, timestamp_utc, accion,
              usuario_id, recurso_tipo, recurso_id, payload, ip_origen
       FROM audit_log
       WHERE timestamp_utc BETWEEN $1 AND $2
       ORDER BY id ASC`,
      [desde, hasta],
    );

    const paiAprobados = await this.dataSource.query(
      `SELECT id, residente_id, version, estado, contenido, aprobado_por,
              aprobado_en, created_at, updated_at
       FROM pai
       WHERE estado = 'aprobado' AND updated_at BETWEEN $1 AND $2
       ORDER BY updated_at ASC`,
      [desde, hasta],
    );

    const exportadoEn = new Date().toISOString();

    await this.auditService.registrar({
      accion: 'EXPORT',
      usuario_id: adminId,
      recurso_tipo: 'paquete_auditoria',
      recurso_id: `${centroSlug}_${exportadoEn}`,
      payload: { desde, hasta, total_incidencias: incidencias.length, total_audit: auditLog.length },
      ip_origen: ip,
    });

    this.logger.log(
      `Paquete de auditoría exportado — ${incidencias.length} incidencias, ${auditLog.length} registros audit (centro: ${centroSlug})`,
    );

    return {
      exportado_en: exportadoEn,
      centro_slug: centroSlug,
      periodo: { desde, hasta },
      incidencias,
      audit_log: auditLog,
      pai_aprobados: paiAprobados,
    };
  }

  /**
   * Revoca una credencial de inspección.
   */
  async revocarCredencial(
    id: string,
    centroSlug: string,
    adminId: string,
    ip?: string,
  ): Promise<void> {
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const resultado = await this.dataSource.query(
      `UPDATE credenciales_inspeccion
       SET activo = false
       WHERE id = $1 AND activo = true
       RETURNING id`,
      [id],
    );

    if (!resultado || resultado.length === 0) {
      throw new NotFoundException(
        `Credencial con ID "${id}" no encontrada o ya revocada`,
      );
    }

    await this.auditService.registrar({
      accion: 'REVOKE',
      usuario_id: adminId,
      recurso_tipo: 'credencial_inspeccion',
      recurso_id: id,
      payload: { revocado_por: adminId },
      ip_origen: ip,
    });

    this.logger.log(`Credencial de inspección revocada: ${id} (centro: ${centroSlug})`);
  }
}
