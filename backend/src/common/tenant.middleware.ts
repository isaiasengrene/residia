import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';

export interface RequestConTenant extends Request {
  centroSlug?: string;
  usuarioId?: string;
  usuarioPerfil?: string;
}

interface JwtPayload {
  sub: string;
  perfil: string;
  centro_slug: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async use(req: RequestConTenant, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }

    const token = authHeader.slice(7);
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new UnauthorizedException('Configuración de seguridad inválida');
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, secret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const { sub: usuarioId, perfil, centro_slug: centroSlug } = payload;

    if (!centroSlug) {
      throw new UnauthorizedException('El token no contiene el centro asociado');
    }

    // Establece el search_path para aislar el tenant en esta petición
    const schemaName = `centro_${centroSlug}`;
    try {
      await this.dataSource.query(
        `SET search_path TO ${schemaName}, shared, public`,
      );
      this.logger.debug(`search_path establecido: ${schemaName}`);
    } catch {
      this.logger.error(
        `Error al establecer search_path para el centro "${centroSlug}"`,
      );
      throw new UnauthorizedException('Centro no encontrado o no disponible');
    }

    // Adjunta la información del tenant a la request
    req.centroSlug = centroSlug;
    req.usuarioId = usuarioId;
    req.usuarioPerfil = perfil;

    next();
  }
}
