import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit.service';
import { RegistrarConsentimientoDto } from './dto/registrar-consentimiento.dto';

export interface Consentimiento {
  id: string;
  residente_id: string;
  version: number;
  estado: 'activo' | 'retirado' | 'pendiente';
  fecha_firma: string | null;
  firmante_nombre: string | null;
  firmante_rol: string | null;
  ip_firma: string | null;
  pdf_hash: string | null;
  created_at: string;
}

export interface RetirarConsentimientoDto {
  motivo?: string;
}

@Injectable()
export class ConsentimientosService {
  private readonly logger = new Logger(ConsentimientosService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Obtiene todos los consentimientos de un residente ordenados por fecha de creación.
   */
  async obtenerPorResidente(
    centroSlug: string,
    residenteId: string,
  ): Promise<Consentimiento[]> {
    this.logger.debug(
      `Consultando consentimientos del residente ${residenteId} (centro: ${centroSlug})`,
    );

    const registros = await this.dataSource.query<Consentimiento[]>(
      `SELECT id, residente_id, version, estado, fecha_firma,
              firmante_nombre, firmante_rol, ip_firma, pdf_hash, created_at
       FROM consentimientos
       WHERE residente_id = $1
       ORDER BY created_at DESC`,
      [residenteId],
    );

    return registros;
  }

  /**
   * Registra un nuevo consentimiento activo para el residente.
   * Cumple con el Art. 7 RGPD y la Ley 41/2002.
   */
  async registrar(
    centroSlug: string,
    dto: RegistrarConsentimientoDto,
    usuarioId: string,
    ip?: string,
  ): Promise<Consentimiento> {
    const [registro] = await this.dataSource.query<Consentimiento[]>(
      `INSERT INTO consentimientos
         (id, residente_id, version, estado, fecha_firma,
          firmante_nombre, firmante_rol, ip_firma, pdf_hash, created_at)
       VALUES
         (gen_random_uuid(), $1, $2, 'activo', NOW(),
          $3, $4, $5::inet, $6, NOW())
       RETURNING id, residente_id, version, estado, fecha_firma,
                 firmante_nombre, firmante_rol, ip_firma, pdf_hash, created_at`,
      [
        dto.residenteId,
        dto.version,
        dto.firmanteNombre,
        dto.firmanteRol,
        ip ?? null,
        dto.pdfHash ?? null,
      ],
    );

    await this.auditService.registrar({
      accion: 'CONSENT_GIVEN',
      usuario_id: usuarioId,
      recurso_tipo: 'consentimiento',
      recurso_id: registro.id,
      payload: {
        residente_id: dto.residenteId,
        version: dto.version,
        firmante_nombre: dto.firmanteNombre,
        firmante_rol: dto.firmanteRol,
      },
      ip_origen: ip,
    });

    this.logger.log(
      `Consentimiento registrado para residente ${dto.residenteId} (ID: ${registro.id})`,
    );

    return registro;
  }

  /**
   * Retira el consentimiento activo de un residente.
   * Conforme a Ley 41/2002: los registros clínicos se CONSERVAN,
   * solo se bloquea el procesamiento futuro.
   */
  async retirar(
    centroSlug: string,
    residenteId: string,
    dto: RetirarConsentimientoDto,
    usuarioId: string,
    ip?: string,
  ): Promise<{ retirados: number; registro: Consentimiento }> {
    // Verificar que existe consentimiento activo
    const [activo] = await this.dataSource.query<Consentimiento[]>(
      `SELECT id FROM consentimientos
       WHERE residente_id = $1 AND estado = 'activo'
       LIMIT 1`,
      [residenteId],
    );

    if (!activo) {
      throw new NotFoundException(
        `No se encontró consentimiento activo para el residente con ID "${residenteId}"`,
      );
    }

    // Marcar los consentimientos activos como retirados
    const resultado = await this.dataSource.query<{ rowCount: number }>(
      `UPDATE consentimientos
       SET estado = 'retirado'
       WHERE residente_id = $1 AND estado = 'activo'`,
      [residenteId],
    );

    const retirados = Array.isArray(resultado) ? resultado.length : 1;

    // Insertar registro de retirada para trazabilidad
    const [registroRetirada] = await this.dataSource.query<Consentimiento[]>(
      `INSERT INTO consentimientos
         (id, residente_id, version, estado, fecha_firma,
          firmante_nombre, firmante_rol, ip_firma, pdf_hash, created_at)
       VALUES
         (gen_random_uuid(), $1, 0, 'retirado', NOW(),
          NULL, NULL, $2::inet, NULL, NOW())
       RETURNING id, residente_id, version, estado, fecha_firma,
                 firmante_nombre, firmante_rol, ip_firma, pdf_hash, created_at`,
      [residenteId, ip ?? null],
    );

    await this.auditService.registrar({
      accion: 'CONSENT_WITHDRAWN',
      usuario_id: usuarioId,
      recurso_tipo: 'consentimiento',
      recurso_id: registroRetirada.id,
      payload: {
        residente_id: residenteId,
        motivo: dto.motivo ?? null,
        // IMPORTANTE: los registros clínicos se conservan según Ley 41/2002
        nota_legal: 'Registros clínicos conservados según Ley 41/2002. Solo se bloquea el procesamiento futuro.',
      },
      ip_origen: ip,
    });

    this.logger.warn(
      `Consentimiento retirado para residente ${residenteId} — procesamiento futuro bloqueado`,
    );

    return { retirados, registro: registroRetirada };
  }

  /**
   * Verifica si un residente tiene consentimiento activo.
   * Usado por otros servicios para bloquear operaciones cuando no hay consentimiento.
   */
  async verificarActivo(
    centroSlug: string,
    residenteId: string,
  ): Promise<boolean> {
    const [resultado] = await this.dataSource.query<[{ existe: boolean }]>(
      `SELECT EXISTS(
         SELECT 1 FROM consentimientos
         WHERE residente_id = $1 AND estado = 'activo'
       ) AS existe`,
      [residenteId],
    );

    return resultado?.existe ?? false;
  }
}
