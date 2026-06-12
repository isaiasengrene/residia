'use client';
// W17: Portal del Familiar · autenticación propia (sin sidebar)
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';

interface IncidenciaFamiliar {
  id: string;
  tipo: string;
  area: string | null;
  fecha: string;
  estado: string;
}

interface ResidentePublico {
  id: string;
  nombre: string;
  apellidos: string;
  habitacion: string | null;
}

interface ComunicacionFamiliar {
  id: string;
  texto: string;
  enviado_en: string;
  leido: boolean;
}

interface DatosFamiliar {
  nombre: string;
  residenteId: string;
}

const COLOR_TIPO: Record<string, string> = {
  Actividad:        '#0FB5A6',
  Nutrición:        '#FF9500',
  'Estado general': '#34C759',
  Caída:            '#FF3B30',
  Medicación:       '#5E5CE6',
};

const ESTADO_LABEL: Record<string, string> = {
  abierta:           'Abierta',
  cerrada:           'Cerrada',
  borrador_whatsapp: 'Borrador',
};

// ─── PANTALLA DE LOGIN ────────────────────────────────────────────────────────
function PantallaLogin({
  onLogin,
}: {
  onLogin: (token: string, familiar: DatosFamiliar) => void;
}) {
  const [email, setEmail] = useState('');
  const [centroSlug, setCentroSlug] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await api.portalFamiliar.login(email, centroSlug) as {
        token: string;
        familiar: DatosFamiliar;
      };
      localStorage.setItem('familiar_token', res.token);
      onLogin(res.token, res.familiar);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F7',
      fontFamily: "-apple-system,'SF Pro Text',system-ui,sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #ECECF0',
        borderRadius: 20,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 28 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(160deg,#102A45,#0071E3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.1A.5.5 0 0 1 5.2 18.2V15.5A2.5 2.5 0 0 1 4 13.4Z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1D1D1F' }}>Portal de familias</div>
            <div style={{ fontSize: 12, color: '#86868B' }}>ResidIA</div>
          </div>
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: '#1D1D1F', marginBottom: 6 }}>
          Acceder
        </div>
        <div style={{ fontSize: 13.5, color: '#86868B', marginBottom: 24 }}>
          Introduce tu correo electrónico para ver las novedades de tu familiar.
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 6 }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.es"
              required
              style={{
                width: '100%',
                padding: '11px 13px',
                border: '1.5px solid #D1D1D6',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                color: '#1D1D1F',
              }}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 6 }}>
              Código del centro
            </label>
            <input
              type="text"
              value={centroSlug}
              onChange={(e) => setCentroSlug(e.target.value)}
              placeholder="nombre-residencia"
              required
              style={{
                width: '100%',
                padding: '11px 13px',
                border: '1.5px solid #D1D1D6',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                color: '#1D1D1F',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0', border: '1px solid #FFCDD2',
              borderRadius: 10, padding: '10px 13px',
              fontSize: 13, color: '#C62828', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%', padding: 13,
              background: cargando ? '#86868B' : '#0071E3',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: 14, cursor: cargando ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>

        <div style={{ marginTop: 20, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="#86868B" strokeWidth="2"/>
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#86868B" strokeWidth="2"/>
          </svg>
          <div style={{ fontSize: 11.5, color: '#6E6E73', lineHeight: 1.5 }}>
            Solo información de <b>bienestar general</b>. Sin datos clínicos. Conforme a la Ley de Protección de Datos.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PORTAL PRINCIPAL ─────────────────────────────────────────────────────────
export default function PortalFamiliarPage() {
  const [tokenFamiliar, setTokenFamiliar] = useState<string | null>(null);
  const [familiar, setFamiliar] = useState<DatosFamiliar | null>(null);
  const [residente, setResidente] = useState<ResidentePublico | null>(null);
  const [incidencias, setIncidencias] = useState<IncidenciaFamiliar[]>([]);
  const [comunicaciones, setComunicaciones] = useState<ComunicacionFamiliar[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  // Restaurar sesión de familiar desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('familiar_token');
    const familiarRaw = localStorage.getItem('familiar_data');
    if (token && familiarRaw) {
      setTokenFamiliar(token);
      setFamiliar(JSON.parse(familiarRaw) as DatosFamiliar);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    if (!tokenFamiliar) return;
    setCargando(true);

    // Usar el token familiar para las llamadas — temporalmente inyectarlo en localStorage
    const tokenAnterior = localStorage.getItem('residia_token');
    localStorage.setItem('residia_token', tokenFamiliar);

    try {
      const [res, inc, com] = await Promise.all([
        api.portalFamiliar.residente() as Promise<ResidentePublico>,
        api.portalFamiliar.incidencias() as Promise<IncidenciaFamiliar[]>,
        api.portalFamiliar.comunicaciones() as Promise<ComunicacionFamiliar[]>,
      ]);
      setResidente(res);
      setIncidencias(inc);
      setComunicaciones(com);
    } catch {
      // Si el token familiar expiró, limpiar sesión
      setTokenFamiliar(null);
      setFamiliar(null);
      localStorage.removeItem('familiar_token');
      localStorage.removeItem('familiar_data');
    } finally {
      // Restaurar token original
      if (tokenAnterior) {
        localStorage.setItem('residia_token', tokenAnterior);
      } else {
        localStorage.removeItem('residia_token');
      }
      setCargando(false);
    }
  }, [tokenFamiliar]);

  useEffect(() => {
    if (tokenFamiliar) {
      void cargarDatos();
    }
  }, [tokenFamiliar, cargarDatos]);

  const handleLogin = (token: string, datosFamiliar: DatosFamiliar) => {
    localStorage.setItem('familiar_data', JSON.stringify(datosFamiliar));
    setTokenFamiliar(token);
    setFamiliar(datosFamiliar);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('familiar_token');
    localStorage.removeItem('familiar_data');
    setTokenFamiliar(null);
    setFamiliar(null);
    setResidente(null);
    setIncidencias([]);
    setComunicaciones([]);
  };

  const handleEnviarMensaje = async () => {
    if (!mensajeTexto.trim() || !tokenFamiliar) return;
    setEnviandoMensaje(true);

    const tokenAnterior = localStorage.getItem('residia_token');
    localStorage.setItem('residia_token', tokenFamiliar);

    try {
      await api.portalFamiliar.enviarMensaje(mensajeTexto.trim());
      setMensajeTexto('');
      void cargarDatos();
    } catch {
      // silenciar error
    } finally {
      if (tokenAnterior) {
        localStorage.setItem('residia_token', tokenAnterior);
      } else {
        localStorage.removeItem('residia_token');
      }
      setEnviandoMensaje(false);
    }
  };

  // Mostrar pantalla de login si no hay sesión familiar
  if (!tokenFamiliar) {
    return <PantallaLogin onLogin={handleLogin} />;
  }

  const hoy = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const iniciales = familiar?.nombre
    ? familiar.nombre.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'FA';

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', fontFamily: "-apple-system,'SF Pro Text',system-ui,sans-serif", color: '#1D1D1F' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg,#102A45,#0071E3)',
        padding: '22px 32px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 13,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'rgba(255,255,255,.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.1A.5.5 0 0 1 5.2 18.2V15.5A2.5 2.5 0 0 1 4 13.4Z" fill="#fff"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 18,
          }}>Portal de familias · ResidIA</div>
          <div style={{ fontSize: 12.5, color: '#C3D6E8' }}>
            {residente ? `${residente.nombre} ${residente.apellidos}` : 'Cargando...'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 12.5 }}>{familiar?.nombre ?? ''}</span>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}
            onClick={handleCerrarSesion}
            title="Cerrar sesión"
          >{iniciales}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
          fontWeight: 700, fontSize: 22, marginBottom: 3,
        }}>Hola, {familiar?.nombre ?? ''}</div>
        <div style={{ fontSize: 13.5, color: '#86868B', marginBottom: 18 }}>
          Novedades de bienestar de{' '}
          <b>{residente ? `${residente.nombre} ${residente.apellidos}` : '—'}</b>{' '}
          {residente?.habitacion ? `· Habitación ${residente.habitacion}` : ''}
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868B', fontSize: 14 }}>
            Cargando novedades...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Últimas incidencias (solo tipo, área y fecha — sin datos clínicos) */}
              <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'linear-gradient(150deg,#1D1D1F,#0FB5A6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                    fontWeight: 700, color: '#fff', fontSize: 10,
                  }}>IA</div>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>Novedades recientes</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#86868B' }}>{hoy}</span>
                </div>

                {incidencias.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#86868B', padding: '8px 0' }}>
                    Sin novedades registradas recientemente.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {incidencias.map((inc) => (
                      <div key={inc.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: COLOR_TIPO[inc.tipo] ?? '#AEAEB2',
                          flexShrink: 0,
                        }}></span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{inc.tipo}</span>
                          {inc.area && (
                            <span style={{ fontSize: 12, color: '#86868B', marginLeft: 6 }}>
                              · {inc.area}
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#86868B', marginLeft: 8 }}>
                            {new Date(inc.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 999,
                          background: inc.estado === 'cerrada' ? '#E8F5E9' : '#FFF8E1',
                          color: inc.estado === 'cerrada' ? '#2E7D32' : '#E65100',
                          fontWeight: 600,
                        }}>
                          {ESTADO_LABEL[inc.estado] ?? inc.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comunicaciones */}
              {comunicaciones.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Mensajes del centro</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {comunicaciones.map((com) => (
                      <div key={com.id} style={{
                        background: com.leido ? '#F5F5F7' : '#EEF4FF',
                        borderRadius: 10, padding: '10px 12px',
                      }}>
                        <div style={{ fontSize: 13, color: '#1D1D1F', lineHeight: 1.5 }}>{com.texto}</div>
                        <div style={{ fontSize: 11, color: '#86868B', marginTop: 5 }}>
                          {new Date(com.enviado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {!com.leido && (
                            <span style={{ marginLeft: 8, color: '#0071E3', fontWeight: 700 }}>Nuevo</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enviar mensaje */}
              <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Enviar mensaje al centro</div>
                <textarea
                  value={mensajeTexto}
                  onChange={(e) => setMensajeTexto(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid #D1D1D6', borderRadius: 10,
                    padding: '10px 12px', fontSize: 13.5, resize: 'none',
                    outline: 'none', color: '#1D1D1F', fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={() => { void handleEnviarMensaje(); }}
                  disabled={enviandoMensaje || !mensajeTexto.trim()}
                  style={{
                    marginTop: 10, width: '100%', padding: 11,
                    background: enviandoMensaje || !mensajeTexto.trim() ? '#86868B' : '#0071E3',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontWeight: 700, fontSize: 13.5,
                    cursor: enviandoMensaje || !mensajeTexto.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {enviandoMensaje ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {/* Residente card */}
              {residente && (
                <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 16, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Tu familiar</div>
                  <div style={{ fontSize: 13, color: '#1D1D1F', fontWeight: 600 }}>
                    {residente.nombre} {residente.apellidos}
                  </div>
                  {residente.habitacion && (
                    <div style={{ fontSize: 12, color: '#86868B', marginTop: 4 }}>
                      Habitación {residente.habitacion}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button style={{
                  background: '#0071E3', color: '#fff', border: 'none',
                  textAlign: 'center', fontWeight: 700, fontSize: 13.5,
                  padding: 12, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', width: '100%',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 5h18v14H3zM3 9h18" stroke="#fff" strokeWidth="1.8"/>
                  </svg>
                  Solicitar visita
                </button>
                <button style={{
                  background: '#fff', border: '1.5px solid #CFE0FB', color: '#0071E3',
                  textAlign: 'center', fontWeight: 700, fontSize: 13.5,
                  padding: 12, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', width: '100%',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h12v12H3zM15 10l6-3v10l-6-3" stroke="#0071E3" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                  Videollamada
                </button>
              </div>

              {/* Privacy note */}
              <div style={{ background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 14, padding: 12, display: 'flex', gap: 9 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="#86868B" strokeWidth="2"/>
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#86868B" strokeWidth="2"/>
                </svg>
                <div style={{ fontSize: 11.5, color: '#6E6E73', lineHeight: 1.5 }}>
                  Solo información de <b>bienestar general</b>. Sin datos clínicos. Acceso previo consentimiento.
                </div>
              </div>

              {/* Cerrar sesión */}
              <button
                onClick={handleCerrarSesion}
                style={{
                  background: 'none', border: '1.5px solid #E5E5EA',
                  borderRadius: 12, padding: '10px 0',
                  color: '#86868B', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', width: '100%',
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
