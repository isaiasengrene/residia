'use client';
// W17: Portal del Familiar · solo lectura (different layout, no sidebar)
import { useEffect, useState } from 'react';

interface Incidencia {
  id: string;
  tipo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  created_at: string;
}

interface Residente {
  id: string;
  nombre: string;
  apellidos: string;
}

// El portal familiar usa datos mock ya que la autenticación familiar es diferente
// En producción, obtendría el token de familiar y cargaría datos reales vía API dedicada
const RESIDENTE_MOCK: Residente = {
  id: 'mock',
  nombre: 'María',
  apellidos: 'Gil',
};

const INCIDENCIAS_MOCK: Incidencia[] = [
  { id: '1', tipo: 'Actividad', descripcion: 'Participó en terapia ocupacional y ejercicios de movilidad', prioridad: 'baja', estado: 'cerrada', created_at: new Date().toISOString() },
  { id: '2', tipo: 'Nutrición', descripcion: 'Buena ingesta en el almuerzo y la cena', prioridad: 'baja', estado: 'cerrada', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', tipo: 'Estado general', descripcion: 'Buen ánimo durante el día', prioridad: 'baja', estado: 'cerrada', created_at: new Date(Date.now() - 172800000).toISOString() },
];

const COLOR_TIPO: Record<string, string> = {
  Actividad:      '#0FB5A6',
  Nutrición:      '#FF9500',
  'Estado general': '#34C759',
};

export default function PortalFamiliarPage() {
  const [residente] = useState<Residente>(RESIDENTE_MOCK);
  const [incidencias] = useState<Incidencia[]>(INCIDENCIAS_MOCK);
  const [cargando, setCargando] = useState(true);
  const [familiar] = useState({ nombre: 'Carmen', apellidos: 'Gómez', iniciales: 'CG' });

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => setCargando(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const hoy = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

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
          <div style={{ fontSize: 12.5, color: '#C3D6E8' }}>Residencia Federico Ozanam</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 12.5 }}>{familiar.nombre} {familiar.apellidos}</span>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 12,
          }}>{familiar.iniciales}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
          fontWeight: 700, fontSize: 22, marginBottom: 3,
        }}>Hola, {familiar.nombre}</div>
        <div style={{ fontSize: 13.5, color: '#86868B', marginBottom: 18 }}>
          Novedades de bienestar de <b>{residente.nombre} {residente.apellidos}</b> · tu familiar
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868B', fontSize: 14 }}>
            Cargando novedades...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Últimas incidencias (solo tipo y fecha, sin datos clínicos) */}
              <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'linear-gradient(150deg,#1D1D1F,#0FB5A6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                    fontWeight: 700, color: '#fff', fontSize: 10,
                  }}>IA</div>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>Hoy</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#86868B' }}>{hoy}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {incidencias.slice(0, 3).map((inc) => (
                    <div key={inc.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: COLOR_TIPO[inc.tipo] ?? '#AEAEB2',
                        flexShrink: 0,
                      }}></span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{inc.tipo}</span>
                        <span style={{ fontSize: 12, color: '#86868B', marginLeft: 8 }}>
                          {new Date(inc.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11.5, color: '#0FB5A6', background: '#E4F7F4', padding: '5px 11px', borderRadius: 999, fontWeight: 600 }}>Buen ánimo</span>
                  <span style={{ fontSize: 11.5, color: '#0071E3', background: '#E7F0FE', padding: '5px 11px', borderRadius: 999, fontWeight: 600 }}>Comida completa</span>
                </div>
              </div>

              {/* Actividades de la semana */}
              <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Actividades de la semana</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  {[
                    { color: '#0FB5A6', label: 'Terapia ocupacional', days: 'Lun, Jue' },
                    { color: '#0071E3', label: 'Musicoterapia', days: 'Mié' },
                    { color: '#FF9500', label: 'Paseo y jardín', days: 'Vie' },
                  ].map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: act.color, flexShrink: 0 }}></span>
                      <span style={{ flex: 1 }}>{act.label}</span>
                      <span style={{ color: '#86868B' }}>{act.days}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
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

              {/* FAQ */}
              <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 16, padding: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'linear-gradient(150deg,#1D1D1F,#0FB5A6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                    fontWeight: 700, color: '#fff', fontSize: 10,
                  }}>IA</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Preguntas frecuentes</div>
                    <div style={{ fontSize: 11.5, color: '#86868B' }}>horarios, trámites, visitas…</div>
                  </div>
                </div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
