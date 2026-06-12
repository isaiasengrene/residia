import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface FamiliarJwtPayload {
  sub: string;        // familiarId
  scope: 'familiar';
  residente_id: string;
  centro_slug: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RequestConFamiliar extends Request {
  familiar?: {
    id: string;
    residenteId: string;
    centroSlug: string;
    email: string;
  };
}

@Injectable()
export class FamiliarAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestConFamiliar>();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acceso familiar no proporcionado');
    }

    const token = authHeader.slice(7);

    let payload: FamiliarJwtPayload;
    try {
      payload = this.jwtService.verify<FamiliarJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token familiar inválido o expirado');
    }

    if (payload.scope !== 'familiar') {
      throw new UnauthorizedException(
        'Token no válido para el portal familiar',
      );
    }

    req.familiar = {
      id: payload.sub,
      residenteId: payload.residente_id,
      centroSlug: payload.centro_slug,
      email: payload.email,
    };

    return true;
  }
}
