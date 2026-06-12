import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;       // usuario_id
  perfil: string;
  centro_slug: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev_secret_cambiar',
    });
  }

  async validate(payload: JwtPayload): Promise<{
    id: string;
    perfil: string;
    centroSlug: string;
    email: string;
  }> {
    return {
      id: payload.sub,
      perfil: payload.perfil,
      centroSlug: payload.centro_slug,
      email: payload.email,
    };
  }
}
