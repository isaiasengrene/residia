import { SetMetadata } from '@nestjs/common';

/**
 * Perfiles de usuario disponibles en ResidIA.
 * Deben coincidir exactamente con el ENUM perfil_usuario de la base de datos.
 */
export enum PerfilUsuario {
  SUPERADMIN        = 'SUPERADMIN',
  ADMIN_CENTRO      = 'ADMIN_CENTRO',
  COORDINADOR       = 'COORDINADOR',
  SANITARIO         = 'SANITARIO',
  AUXILIAR          = 'AUXILIAR',
  TRABAJADOR_SOCIAL = 'TRABAJADOR_SOCIAL',
  FAMILIAR          = 'FAMILIAR',
  INSPECTOR         = 'INSPECTOR',
}

export const ROLES_KEY = 'roles';

/**
 * Decorador para restringir el acceso a rutas según el perfil del usuario.
 * Uso: @Roles(PerfilUsuario.ADMIN_CENTRO, PerfilUsuario.COORDINADOR)
 */
export const Roles = (...roles: PerfilUsuario[]) =>
  SetMetadata(ROLES_KEY, roles);
