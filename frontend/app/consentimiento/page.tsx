'use client';
// W11: Consentimiento RGPD · alta del residente
import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { api } from '../../lib/api';

interface Residente {
  id: string;
  nombre: string;
  apellidos: string;
}

interface Consentimiento {
  id: string;
  residente_id: string;
  version: number;
  estado: 'activo' | 'retirado' | 'pendiente';
  fecha_firma: string | null;
  firmante_nombre: string | null;
  firmante_rol: string | null;
  created_at: string;
}

const COLOR_ESTADO: Record<string, { bg: string; color: string; label: string }> = {
  activo:   { bg: '#E8F7EF', color: '#248A3D', label: 'Activo' },
  retirado: { bg: '#FDECEC', color: '#C62828', label: 'Retirado' },
  pendiente:{ bg: '#FBF0DC', color: '#9A6410', label: 'Pendiente' },
};

export default function ConsentimientoPage() {
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [consentimientos, setConsentimientos] = useState<Record<string, Consentimiento | null>>({});
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const res = await api.residentes.listar() as Residente[];
        setResidentes(res);
        // Cargar consentimientos de cada residente en paralelo
        const entradas = await Promise.all(
          res.map(async (r) => {
            try {
              const lista = await api.consentimientos.porResidente(r.id) as Consentimiento[];
              const activo = lista.find((c) => c.estado === 'activo')
                ?? lista[0]
                ?? null;
              return [r.id, activo] as [string, Consentimiento | null];
            } catch {
              return [r.id, null] as [string, Consentimiento | null];
            }
          }),
        );
        setConsentimientos(Object.fromEntries(entradas));
      } catch {
        console.error('Error al cargar residentes');
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

  const handleRegistrar = async (residenteId: string) => {
    setRegistrando(residenteId);
    try {
      await api.consentimientos.registrar({
        residenteId,
        estado: 'pendiente',
        firmante_nombre: '',
        firmante_rol: 'representante_legal',
      });
      // Recargar consentimiento de este residente
      const lista = await api.consentimientos.porResidente(residenteId) as Consentimiento[];
      const activo = lista.find((c) => c.estado === 'activo') ?? lista[0] ?? null;
      setConsentimientos((prev) => ({ ...prev, [residenteId]: activo }));
    } catch {
      alert('Error al registrar el consentimiento. Inténtelo de nuevo.');
    } finally {
      setRegistrando(null);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, color: '#86868B' }}>Gestión</span>
          <span style={{ fontSize: 12.5, color: '#C7C7CC' }}>/</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Consentimientos RGPD</span>
        </div>

        <div style={{
          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
          fontWeight: 700, fontSize: 21, letterSpacing: -0.3, marginBottom: 4,
        }}>Consentimientos informados</div>
        <div style={{ fontSize: 13, color: '#86868B', marginBottom: 18 }}>
          Estado de consentimiento RGPD por residente
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868B', fontSize: 14 }}>
            Cargando residentes...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {residentes.length === 0 && (
              <div style={{ color: '#86868B', fontSize: 13, padding: 16 }}>
                No hay residentes registrados.
              </div>
            )}
            {residentes.map((r) => {
              const c = consentimientos[r.id];
              const col = c ? (COLOR_ESTADO[c.estado] ?? COLOR_ESTADO.pendiente) : { bg: '#F5F5F7', color: '#6E6E73', label: 'Sin registro' };

              return (
                <div
                  key={r.id}
                  style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: '#E7F0FE', color: '#0071E3',
                      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                      fontWeight: 700, fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {r.nombre[0]}{r.apellidos[0]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.nombre} {r.apellidos}</div>
                      {c ? (
                        <div style={{ fontSize: 12, color: '#86868B', marginTop: 2 }}>
                          {c.fecha_firma
                            ? `Firmado el ${new Date(c.fecha_firma).toLocaleDateString('es-ES')}`
                            : 'Sin fecha de firma'}
                          {c.firmante_nombre ? ` · ${c.firmante_nombre}` : ''}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: '#86868B', marginTop: 2 }}>Sin consentimiento registrado</div>
                      )}
                    </div>

                    {/* Estado badge */}
                    <span style={{
                      background: col.bg, color: col.color,
                      fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 999,
                    }}>
                      {col.label}
                    </span>

                    {/* Acción */}
                    {(!c || c.estado !== 'activo') && (
                      <button
                        onClick={() => void handleRegistrar(r.id)}
                        disabled={registrando === r.id}
                        style={{
                          background: registrando === r.id ? '#F5F5F7' : '#0071E3',
                          color: registrando === r.id ? '#86868B' : '#fff',
                          border: 'none', borderRadius: 10,
                          padding: '8px 14px', fontSize: 12, fontWeight: 700,
                          cursor: registrando === r.id ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {registrando === r.id ? 'Registrando...' : 'Registrar consentimiento'}
                      </button>
                    )}
                  </div>

                  {/* Aviso sin consentimiento activo */}
                  {(!c || c.estado !== 'activo') && (
                    <div style={{ marginTop: 11, display: 'flex', gap: 9, background: '#FFF7ED', border: '1px solid #FBE3C0', borderRadius: 10, padding: '9px 12px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div style={{ fontSize: 12, color: '#7A5410', lineHeight: 1.5 }}>
                        Sin consentimiento <b>ACTIVO</b>, los módulos clínicos quedan en <b>solo lectura</b> hasta su firma o renovación.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Aviso legal global */}
        <div style={{ marginTop: 20, background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 14, padding: 13, display: 'flex', gap: 9 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="#86868B" strokeWidth="2"/>
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#86868B" strokeWidth="2"/>
          </svg>
          <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.5 }}>
            El PDF/A generado incluye sello TSA + SHA-256 y queda guardado como inmutable en el expediente del residente.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
