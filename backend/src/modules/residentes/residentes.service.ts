import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../../common/audit.service';

export interface Residente {
  id: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  habitacion: string | null;
  activo: boolean;
  created_at: string;
}

export interface CrearResidenteDto {
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;
  habitacion?: string;
}

export interface ActualizarResidenteDto {
  nombre?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  habitacion?: string;
  activo?: boolean;
}

@Injectable()
export class ResidentesService {
  private readonly logger = new Logger(ResidentesService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Lista todos los residentes activos del tenant actual.
   * El search_path ya está configurado por el TenantMiddleware.
   */
  async listarActivos(): Promise<Residente[]> {
    const residentes = await this.dataSource.query<Residente[]>(
      `SELECT id, nombre, apellidos, fecha_nacimiento, habitacion, activo, created_at
       FROM residentes
       WHERE activo = TRUE
       ORDER BY apellidos, nombre`,
    );

    this.logger.debug(`Listado de residentes: ${residentes.length} registros`);
    return residentes;
  }

  /**
   * Obtiene un residente por su ID.
   */
  async obtenerPorId(id: string): Promise<Residente> {
    const [residente] = await this.dataSource.query<Residente[]>(
      `SELECT id, nombre, apellidos, fecha_nacimiento, habitacion, activo, created_at
       FROM residentes
       WHERE id = $1`,
      [id],
    );

    if (!residente) {
      throw new NotFoundException(`Residente con ID "${id}" no encontrado`);
    }

    return residente;
  }

  /**
   * Crea un nuevo residente y registra la acción en auditoría.
   */
  async crear(
    dto: CrearResidenteDto,
    usuarioId: string,
    ipOrigen?: string,
  ): Promise<Residente> {
    const [nuevoResidente] = await this.dataSource.query<Residente[]>(
      `INSERT INTO residentes (nombre, apellidos, fecha_nacimiento, habitacion)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, apellidos, fecha_nacimiento, habitacion, activo, created_at`,
      [dto.nombre, dto.apellidos, dto.fecha_nacimiento, dto.habitacion ?? null],
    );

    // Registro de auditoría obligatorio
    await this.auditService.registrar({
      accion: 'CREAR_RESIDENTE',
      usuario_id: usuarioId,
      recurso_tipo: 'residente',
      recurso_id: nuevoResidente.id,
      payload: { nombre: dto.nombre, apellidos: dto.apellidos },
      ip_origen: ipOrigen,
    });

    this.logger.log(
      `Residente creado: ${dto.nombre} ${dto.apellidos} (ID: ${nuevoResidente.id})`,
    );

    return nuevoResidente;
  }

  /**
   * Actualiza los datos de un residente y registra la acción en auditoría.
   */
  async actualizar(
    id: string,
    dto: ActualizarResidenteDto,
    usuarioId: string,
    ipOrigen?: string,
  ): Promise<Residente> {
    // Verificar que existe
    await this.obtenerPorId(id);

    // Construir la consulta de actualización dinámicamente
    const campos: string[] = [];
    const valores: unknown[] = [];
    let contador = 1;

    if (dto.nombre !== undefined) {
      campos.push(`nombre = $${contador++}`);
      valores.push(dto.nombre);
    }
    if (dto.apellidos !== undefined) {
      campos.push(`apellidos = $${contador++}`);
      valores.push(dto.apellidos);
    }
    if (dto.fecha_nacimiento !== undefined) {
      campos.push(`fecha_nacimiento = $${contador++}`);
      valores.push(dto.fecha_nacimiento);
    }
    if (dto.habitacion !== undefined) {
      campos.push(`habitacion = $${contador++}`);
      valores.push(dto.habitacion);
    }
    if (dto.activo !== undefined) {
      campos.push(`activo = $${contador++}`);
      valores.push(dto.activo);
    }

    if (campos.length === 0) {
      return this.obtenerPorId(id);
    }

    valores.push(id);
    const [residenteActualizado] = await this.dataSource.query<Residente[]>(
      `UPDATE residentes SET ${campos.join(', ')}
       WHERE id = $${contador}
       RETURNING id, nombre, apellidos, fecha_nacimiento, habitacion, activo, created_at`,
      valores,
    );

    // Registro de auditoría obligatorio
    await this.auditService.registrar({
      accion: 'ACTUALIZAR_RESIDENTE',
      usuario_id: usuarioId,
      recurso_tipo: 'residente',
      recurso_id: id,
      payload: dto as Record<string, unknown>,
      ip_origen: ipOrigen,
    });

    this.logger.log(`Residente actualizado (ID: ${id})`);
    return residenteActualizado;
  }
}
