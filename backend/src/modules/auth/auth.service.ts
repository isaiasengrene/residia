import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';

interface UsuarioDb {
  id: string;
  email: string;
  password_hash: string;
  nombre: string;
  apellidos: string;
  perfil: string;
  totp_secret: string | null;
  activo: boolean;
  centro_id: string;
}

interface CentroDb {
  slug: string;
}

export interface JwtPayload {
  sub: string;
  perfil: string;
  centro_slug: string;
  email: string;
}

export interface RespuestaLogin {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    perfil: string;
    centroSlug: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async login(
    email: string,
    password: string,
    codigo2fa?: string,
  ): Promise<RespuestaLogin> {
    // Buscar usuario en el esquema compartido
    const [usuario] = await this.dataSource.query<UsuarioDb[]>(
      `SELECT u.id, u.email, u.password_hash, u.nombre, u.apellidos,
              u.perfil, u.totp_secret, u.activo, u.centro_id
       FROM shared.usuarios u
       WHERE u.email = $1`,
      [email],
    );

    if (!usuario) {
      this.logger.warn(`Intento de acceso con email no registrado: ${email}`);
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta de usuario está desactivada');
    }

    // Verificar contraseña con argon2
    let contrasenaValida: boolean;
    try {
      contrasenaValida = await argon2.verify(usuario.password_hash, password);
    } catch {
      throw new UnauthorizedException('Error al verificar las credenciales');
    }

    if (!contrasenaValida) {
      this.logger.warn(`Contraseña incorrecta para el usuario: ${email}`);
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar 2FA si el usuario lo tiene configurado
    if (usuario.totp_secret) {
      if (!codigo2fa) {
        throw new UnauthorizedException(
          'Se requiere el código de doble factor de autenticación',
        );
      }

      const totpValido = speakeasy.totp.verify({
        secret: usuario.totp_secret,
        encoding: 'base32',
        token: codigo2fa,
        window: 1, // Tolerancia de ±30 segundos
      });

      if (!totpValido) {
        this.logger.warn(`Código 2FA inválido para el usuario: ${email}`);
        throw new UnauthorizedException(
          'Código de doble factor incorrecto o expirado',
        );
      }
    }

    // Obtener el slug del centro asociado al usuario
    const [centro] = await this.dataSource.query<CentroDb[]>(
      `SELECT slug FROM shared.centros WHERE id = $1`,
      [usuario.centro_id],
    );

    if (!centro) {
      throw new NotFoundException('Centro no encontrado para este usuario');
    }

    // Generar JWT con los datos del tenant
    const payload: JwtPayload = {
      sub: usuario.id,
      perfil: usuario.perfil,
      centro_slug: centro.slug,
      email: usuario.email,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(
      `Sesión iniciada — usuario: ${email}, centro: ${centro.slug}, perfil: ${usuario.perfil}`,
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellidos}`,
        perfil: usuario.perfil,
        centroSlug: centro.slug,
        email: usuario.email,
      },
    };
  }

  validarToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
