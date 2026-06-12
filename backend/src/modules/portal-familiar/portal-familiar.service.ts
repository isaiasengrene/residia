import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

interface AccesoFamiliarDb {
  id: string;
  residente_id: string;
  nombre_familiar: string;
  email: string;
  relacion: string;
  activo: boolean;
}

export interface ResidentePublico {
  id: string;
  nombre: string;
  apellidos: string;
  habitacion: string | null;
}

export interface IncidenciaFamiliar {
  id: string;
  tipo: string;
  area: string | null;
  fecha: string;
  estado: string;
}

export interface ComunicacionFamiliar {
  id: string;
  texto: string;
  enviado_en: string;
  leido: boolean;
}

@Injectable()
export class PortalFamiliarService {
  private readonly logger = new Logger(PortalFamiliarService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Autenticación de familiar por email — basada en enlace (sin contraseña).
   * Emite un JWT con scope='familiar' ligado al residente correspondiente.
   */
  async loginFamiliar(
    email: string,
    centroSlug: string,
  ): Promise<{ token: string; familiar: { nombre: string; residenteId: string } }> {
    // Establecer search_path del centro
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [familiar] = await this.dataSource.query<AccesoFamiliarDb[]>(
      `SELECT id, residente_id, nombre_familiar, email, relacion, activo
       FROM accesos_familiares
       WHERE email = $1 AND activo = true
       LIMIT 1`,
      [email],
    );

    if (!familiar) {
      this.logger.warn(
        `Acceso familiar denegado — email no registrado: ${email} (centro: ${centroSlug})`,
      );
      throw new UnauthorizedException(
        'No se encontró acceso familiar para este correo electrónico',
      );
    }

    const payload = {
      sub: familiar.id,
      scope: 'familiar' as const,
      residente_id: familiar.residente_id,
      centro_slug: centroSlug,
      email: familiar.email,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    this.logger.log(
      `Acceso familiar concedido — familiar: ${familiar.email}, residente: ${familiar.residente_id}, centro: ${centroSlug}`,
    );

    return {
      token,
      familiar: {
        nombre: familiar.nombre_familiar,
        residenteId: familiar.residente_id,
      },
    };
  }

  /**
   * Devuelve datos básicos del residente (sin datos clínicos).
   * Solo: nombre, apellidos, habitacion.
   */
  async obtenerResidente(
    familiarId: string,
    centroSlug: string,
  ): Promise<ResidentePublico> {
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    // Obtener el residente_id a partir del familiar
    const [acceso] = await this.dataSource.query<Array<{ residente_id: string }>>(
      `SELECT residente_id FROM accesos_familiares WHERE id = $1 AND activo = true`,
      [familiarId],
    );

    if (!acceso) {
      throw new NotFoundException('Acceso familiar no encontrado');
    }

    const [residente] = await this.dataSource.query<ResidentePublico[]>(
      `SELECT id, nombre, apellidos, habitacion
       FROM residentes
       WHERE id = $1`,
      [acceso.residente_id],
    );

    if (!residente) {
      throw new NotFoundException('Residente no encontrado');
    }

    return residente;
  }

  /**
   * Devuelve las últimas 10 incidencias del residente.
   * NUNCA incluye descripcion, prioridad ni datos clínicos.
   */
  async obtenerIncidencias(
    familiarId: string,
    centroSlug: string,
  ): Promise<IncidenciaFamiliar[]> {
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [acceso] = await this.dataSource.query<Array<{ residente_id: string }>>(
      `SELECT residente_id FROM accesos_familiares WHERE id = $1 AND activo = true`,
      [familiarId],
    );

    if (!acceso) {
      throw new NotFoundException('Acceso familiar no encontrado');
    }

    // Solo campos no clínicos: tipo, area, fecha, estado
    const incidencias = await this.dataSource.query<IncidenciaFamiliar[]>(
      `SELECT id, tipo, area, created_at AS fecha, estado
       FROM incidencias
       WHERE residente_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [acceso.residente_id],
    );

    return incidencias;
  }

  /**
   * Devuelve las últimas 10 comunicaciones enviadas a este familiar.
   */
  async obtenerComunicaciones(
    familiarId: string,
    centroSlug: string,
  ): Promise<ComunicacionFamiliar[]> {
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const comunicaciones = await this.dataSource.query<ComunicacionFamiliar[]>(
      `SELECT id, texto, enviado_en, leido
       FROM mensajes_familiares
       WHERE familiar_id = $1
       ORDER BY enviado_en DESC
       LIMIT 10`,
      [familiarId],
    );

    return comunicaciones;
  }

  /**
   * Envía un mensaje desde el familiar hacia el centro.
   */
  async enviarMensaje(
    familiarId: string,
    centroSlug: string,
    texto: string,
  ): Promise<{ id: string; enviado_en: string }> {
    const schemaName = `centro_${centroSlug}`;
    await this.dataSource.query(
      `SET search_path TO ${schemaName}, shared, public`,
    );

    const [mensaje] = await this.dataSource.query<Array<{ id: string; enviado_en: string }>>(
      `INSERT INTO mensajes_familiares (familiar_id, texto, enviado_en, direccion)
       VALUES ($1, $2, NOW(), 'entrante')
       RETURNING id, enviado_en`,
      [familiarId, texto],
    );

    this.logger.log(
      `Mensaje de familiar ${familiarId} recibido (centro: ${centroSlug})`,
    );

    return mensaje;
  }
}
