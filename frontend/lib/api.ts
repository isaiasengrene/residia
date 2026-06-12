const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('residia_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('residia_token');
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error del servidor' })) as { message?: string };
    throw new Error(error.message ?? 'Error desconocido');
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string, codigo2fa: string) =>
      request<{ token: string; usuario: { id: string; nombre: string; perfil: string; centroSlug: string } }>(
        '/auth/login', { method: 'POST', body: JSON.stringify({ email, password, codigo2fa }) }
      ),
  },
  residentes: {
    listar: () => request<unknown[]>('/residentes'),
    obtener: (id: string) => request<unknown>(`/residentes/${id}`),
    crear: (data: unknown) => request<unknown>('/residentes', { method: 'POST', body: JSON.stringify(data) }),
  },
  incidencias: {
    listar: (filtros?: { prioridad?: string; estado?: string }) => {
      const params = new URLSearchParams(filtros as Record<string, string>).toString();
      return request<unknown[]>(`/incidencias${params ? '?' + params : ''}`);
    },
    obtener: (id: string) => request<unknown>(`/incidencias/${id}`),
    crear: (data: unknown) => request<unknown>('/incidencias', { method: 'POST', body: JSON.stringify(data) }),
    cerrar: (id: string) => request<unknown>(`/incidencias/${id}/cerrar`, { method: 'PATCH' }),
  },
  consentimientos: {
    porResidente: (residenteId: string) => request<unknown[]>(`/consentimientos/residente/${residenteId}`),
    registrar: (data: unknown) => request<unknown>('/consentimientos', { method: 'POST', body: JSON.stringify(data) }),
    retirar: (residenteId: string, motivo: string) =>
      request<unknown>(`/consentimientos/${residenteId}/retirar`, { method: 'POST', body: JSON.stringify({ motivo }) }),
  },
  turnos: {
    listar: (fecha?: string) => request<unknown[]>(`/turnos${fecha ? '?fecha=' + fecha : ''}`),
    actual: () => request<unknown>('/turnos/actual'),
    iniciar: (data: unknown) => request<unknown>('/turnos', { method: 'POST', body: JSON.stringify(data) }),
    cerrar: (id: string, data: unknown) => request<unknown>(`/turnos/${id}/cerrar`, { method: 'PATCH', body: JSON.stringify(data) }),
    traspasar: (id: string, data: unknown) => request<unknown>(`/turnos/${id}/traspasar`, { method: 'POST', body: JSON.stringify(data) }),
  },
  modelosIa: {
    listar: () => request<unknown[]>('/admin/modelos-ia'),
    crear: (data: unknown) => request<unknown>('/admin/modelos-ia', { method: 'POST', body: JSON.stringify(data) }),
    activar: (id: string) => request<unknown>(`/admin/modelos-ia/${id}/activar`, { method: 'PATCH' }),
    desactivar: (id: string) => request<unknown>(`/admin/modelos-ia/${id}/desactivar`, { method: 'PATCH' }),
    eliminar: (id: string) => request<unknown>(`/admin/modelos-ia/${id}`, { method: 'DELETE' }),
  },
  auditoria: {
    listar: (pagina?: number) => request<unknown>(`/auditoria${pagina ? '?pagina=' + pagina : ''}`),
    verificar: () => request<{ integra: boolean; registros: number; roturas: number[] }>('/auditoria/verificar'),
  },
  expediente: {
    obtener: (residenteId: string) => request<unknown>(`/expediente/${residenteId}`),
    exportar: (residenteId: string) => request<unknown>(`/expediente/${residenteId}/exportar`),
  },
  pai: {
    listar: () => request<unknown[]>('/pai'),
    porResidente: (residenteId: string) => request<unknown[]>(`/pai/residente/${residenteId}`),
    obtener: (id: string) => request<unknown>(`/pai/${id}`),
    crear: (data: unknown) => request<unknown>('/pai', { method: 'POST', body: JSON.stringify(data) }),
    generarIA: (residenteId: string) => request<unknown>(`/pai/generar-ia/${residenteId}`, { method: 'POST' }),
    aprobar: (id: string) => request<unknown>(`/pai/${id}/aprobar`, { method: 'PATCH' }),
    archivar: (id: string) => request<unknown>(`/pai/${id}/archivar`, { method: 'PATCH' }),
  },
  jobs: {
    estado: (cola: string, jobId: string) => request<unknown>(`/jobs/${cola}/${jobId}`),
  },
  agentesIA: {
    health: () => request<unknown>('/agentes/health'),
    seguimiento: (residenteId: string) => request<unknown>(`/agentes/seguimiento/${residenteId}`, { method: 'POST' }),
  },
  portalFamiliar: {
    login: (email: string, centroSlug: string) => request<unknown>('/portal-familiar/login', { method: 'POST', body: JSON.stringify({ email, centroSlug }) }),
    residente: () => request<unknown>('/portal-familiar/residente'),
    incidencias: () => request<unknown>('/portal-familiar/incidencias'),
    comunicaciones: () => request<unknown>('/portal-familiar/comunicaciones'),
    enviarMensaje: (texto: string) => request<unknown>('/portal-familiar/mensaje', { method: 'POST', body: JSON.stringify({ texto }) }),
  },
  inspeccion: {
    generarCredencial: (horas: number, ambito: string) => request<unknown>('/inspeccion/credencial', { method: 'POST', body: JSON.stringify({ horas, ambito }) }),
    validar: (codigo: string, centroSlug: string) => request<unknown>('/inspeccion/validar', { method: 'POST', body: JSON.stringify({ codigo, centroSlug }) }),
    exportar: (desde: string, hasta: string) => request<unknown>(`/inspeccion/exportar?desde=${desde}&hasta=${hasta}`),
  },
  documentos: {
    pdfIncidencia: (id: string) => `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/documentos/incidencia/${id}/pdf`,
    pdfPai: (id: string) => `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/documentos/pai/${id}/pdf`,
  },
};
