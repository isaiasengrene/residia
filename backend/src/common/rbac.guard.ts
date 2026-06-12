import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PerfilUsuario } from './roles.decorator';
import { RequestConTenant } from './tenant.middleware';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos desde los metadatos del decorador @Roles
    const rolesRequeridos = this.reflector.getAllAndOverride<PerfilUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se definieron roles, la ruta es pública (o protegida solo por JWT)
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestConTenant>();
    const perfilUsuario = req.usuarioPerfil as PerfilUsuario | undefined;

    if (!perfilUsuario) {
      throw new ForbiddenException(
        'Acceso denegado: no se pudo determinar el perfil del usuario',
      );
    }

    const tieneAcceso = rolesRequeridos.includes(perfilUsuario);

    if (!tieneAcceso) {
      throw new ForbiddenException(
        'Acceso denegado: perfil insuficiente',
      );
    }

    return true;
  }
}
