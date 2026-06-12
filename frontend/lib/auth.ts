import { api } from './api';

export interface Usuario {
  id: string;
  nombre: string;
  perfil: string;
  centroSlug: string;
}

export function guardarSesion(token: string, usuario: Usuario): void {
  localStorage.setItem('residia_token', token);
  localStorage.setItem('residia_usuario', JSON.stringify(usuario));
}

export function obtenerUsuario(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('residia_usuario');
  return raw ? (JSON.parse(raw) as Usuario) : null;
}

export function cerrarSesion(): void {
  localStorage.removeItem('residia_token');
  localStorage.removeItem('residia_usuario');
  window.location.href = '/';
}

export async function iniciarSesion(email: string, password: string, codigo2fa: string): Promise<Usuario> {
  const res = await api.auth.login(email, password, codigo2fa);
  guardarSesion(res.token, res.usuario);
  return res.usuario;
}
