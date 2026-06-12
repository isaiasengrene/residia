import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit.service';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { CerrarTurnoDto } from './dto/cerrar-turno.dto';
import { TraspasoTurnoDto } from './dto/traspasar-turno.dto';

export interface Turno {
  id: string;
  tipo: 'mañana' | 'tarde' | 'noche';
  fecha: string;
  inicio: string;
  fin: string | null;
  profesional_id: string;
  profesional_nombre: string;
  estado: 'activo' | 'cerrado' | 'traspasado';
  notas: string | null;
  firma_hash: string | null;
  traspaso_resumen: string | null;
  created_at: string;
}

@Injectable()
export class TurnosService {
  private readonly logger = new Logger(TurnosService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Lista los turnos de una fecha específica (por defecto hoy).
   */
  async listar(centroSlug: string, fecha?: string): Promise<Turno[]> {
    const fechaConsulta = fecha ?? new Date().toISOString().slice(0, 10);

    const turnos = await this.dataSource.query<Turno[]>(
      `SELECT id, tipo, fecha, inicio, fin, profesional_id, profesional_nombre,
              estado, notas, firma_hash, traspaso_resumen, created_at
       FROM turnos
       WHERE fecha = $1
       ORDER BY inicio DESC`,
      [fechaConsulta],
    );

    this.logger.debug(
      `Turnos del ${fechaConsulta}: ${turnos.length} registros (centro: ${centroSlug})`,
    );

    return turnos;
  }

  /**
   * Inicia un nuevo turno para el profesional autenticado.
   */
  async iniciar(
    centroSlug: string,
    dto: IniciarTurnoDto,
    usuarioId: string,
    ip?: string,
  ): Promise<Turno> {
    const [turno] = await this.dataSource.query<Turno[]>(
      `INSERT INTO turnos
         (tipo, fecha, inicio, profesional_id, profesional_nombre, estado, created_at)
       VALUES
         ($1, CURRENT_DATE, NOW(), $2, $3, 'activo', NOW())
       RETURNING id, tipo, fecha, inicio, fin, profesional_id, profesional_nombre,
                 estado, notas, firma_hash, traspaso_resumen, created_at`,
      [dto.tipo, usuarioId, dto.profesionalNombre],
    );

    await this.auditService.registrar({
      accion: 'CREATE',
      usuario_id: usuarioId,
      recurso_tipo: 'turno',
      recurso_id: turno.id,
      payload: {
        tipo: dto.tipo,
        profesional_nombre: dto.profesionalNombre,
      },
      ip_origen: ip,
    });

    this.logger.log(
      `Turno iniciado: tipo=${dto.tipo}, profesional=${dto.profesionalNombre} (ID: ${turno.id})`,
    );

    return turno;
  }

  /**
   * Cierra un turno activo con notas y hash de firma.
   */
  async cerrar(
    centroSlug: string,
    turnoId: string,
    dto: CerrarTurnoDto,
    usuarioId: string,
    ip?: string,
  ): Promise<Turno> {
    const [turno] = await this.dataSource.query<Turno[]>(
      `UPDATE turnos
       SET estado = 'cerrado', fin = NOW(), notas = $2, firma_hash = $3
       WHERE id = $1 AND estado = 'activo'
       RETURNING id, tipo, fecha, inicio, fin, profesional_id, profesional_nombre,
                 estado, notas, firma_hash, traspaso_resumen, created_at`,
      [turnoId, dto.notas ?? null, dto.firmaHash ?? null],
    );

    if (!turno) {
      throw new NotFoundException(
        `Turno con ID "${turnoId}" no encontrado o no está activo`,
      );
    }

    await this.auditService.registrar({
      accion: 'UPDATE',
      usuario_id: usuarioId,
      recurso_tipo: 'turno',
      recurso_id: turnoId,
      payload: { accion: 'cerrar', notas: dto.notas ?? null },
      ip_origen: ip,
    });

    this.logger.log(`Turno cerrado (ID: ${turnoId})`);
    return turno;
  }

  /**
   * Marca un turno como traspasado con un resumen del traspaso.
   */
  async traspasar(
    centroSlug: string,
    turnoId: string,
    dto: TraspasoTurnoDto,
    usuarioId: string,
    ip?: string,
  ): Promise<Turno> {
    const [turno] = await this.dataSource.query<Turno[]>(
      `UPDATE turnos
       SET estado = 'traspasado', traspaso_resumen = $2, fin = COALESCE(fin, NOW())
       WHERE id = $1 AND estado IN ('activo', 'cerrado')
       RETURNING id, tipo, fecha, inicio, fin, profesional_id, profesional_nombre,
                 estado, notas, firma_hash, traspaso_resumen, created_at`,
      [turnoId, dto.traspasoResumen],
    );

    if (!turno) {
      throw new NotFoundException(
        `Turno con ID "${turnoId}" no encontrado o no se puede traspasar`,
      );
    }

    await this.auditService.registrar({
      accion: 'UPDATE',
      usuario_id: usuarioId,
      recurso_tipo: 'turno',
      recurso_id: turnoId,
      payload: { accion: 'traspasar', resumen: dto.traspasoResumen },
      ip_origen: ip,
    });

    this.logger.log(`Turno traspasado (ID: ${turnoId})`);
    return turno;
  }

  /**
   * Obtiene el turno activo del profesional autenticado.
   */
  async turnoActual(
    centroSlug: string,
    profesionalId: string,
  ): Promise<Turno | null> {
    const [turno] = await this.dataSource.query<Turno[]>(
      `SELECT id, tipo, fecha, inicio, fin, profesional_id, profesional_nombre,
              estado, notas, firma_hash, traspaso_resumen, created_at
       FROM turnos
       WHERE profesional_id = $1 AND estado = 'activo'
       ORDER BY inicio DESC
       LIMIT 1`,
      [profesionalId],
    );

    return turno ?? null;
  }
}
