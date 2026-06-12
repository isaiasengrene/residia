'use client';
// W13: Turnos · firma + traspaso por IA
import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { api } from '../../lib/api';

interface Turno {
  id: string;
  tipo: 'mañana' | 'tarde' | 'noche';
  fecha: string;
  inicio: string;
  fin: string | null;
  profesional_id: string;
  profesional_nombre: string;
  estado: 'activo' | 'cerrado' | 'traspasado';
  notas: string | null;
  firma_hash: string | null;
  traspaso_resumen: string | null;
  created_at: string;
}

const ETIQUETA_TURNO: Record<string, string> = {
  mañana: 'Turno de mañana',
  tarde:  'Turno de tarde',
  noche:  'Turno de noche',
};

const COLOR_ESTADO: Record<string, { bg: string; color: string; dot: string }> = {
  activo:     { bg: '#E8F7EF', color: '#34C759', dot: '#34C759' },
  cerrado:    { bg: '#F5F5F7', color: '#6E6E73', dot: '#AEAEB2' },
  traspasado: { bg: '#E7F0FE', color: '#0071E3', dot: '#0071E3' },
};

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [cerrando, setCerrando] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await api.turnos.listar();
      setTurnos(resultado as Turno[]);
    } catch {
      setError('No se pudieron cargar los turnos. Verifique su conexión.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const turnoActivo = turnos.find((t) => t.estado === 'activo');

  const handleIniciarTurno = async () => {
    setIniciando(true);
    try {
      await api.turnos.iniciar({
        tipo: 'mañana',
        profesionalNombre: 'Usuario actual',
      });
      await cargar();
    } catch {
      alert('Error al iniciar el turno. Inténtelo de nuevo.');
    } finally {
      setIniciando(false);
    }
  };

  const handleCerrarTurno = async (id: string) => {
    setCerrando(id);
    try {
      await api.turnos.cerrar(id, { notas: 'Turno cerrado desde el panel.' });
      await cargar();
    } catch {
      alert('Error al cerrar el turno. Inténtelo de nuevo.');
    } finally {
      setCerrando(null);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Gestión de turnos</div>
            <div style={{ fontSize: 13.5, color: '#86868B', marginTop: 3 }}>
              Inicio y fin con firma electrónica · traspaso asistido por IA
            </div>
          </div>
          {turnoActivo ? (
            <span style={{ fontSize: 12, color: '#34C759', background: '#E8F7EF', padding: '6px 12px', borderRadius: 999, fontWeight: 600 }}>
              ● {ETIQUETA_TURNO[turnoActivo.tipo] ?? 'Turno'} en curso
            </span>
          ) : (
            <button
              onClick={() => void handleIniciarTurno()}
              disabled={iniciando}
              style={{
                background: iniciando ? '#AEAEB2' : '#0071E3',
                color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 13, padding: '10px 15px', borderRadius: 11,
                cursor: iniciando ? 'not-allowed' : 'pointer',
              }}
            >
              {iniciando ? 'Iniciando...' : 'Iniciar turno'}
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: '#FDECEC', border: '1px solid #FFCDD2', borderRadius: 11, padding: '10px 15px', marginBottom: 14, fontSize: 13, color: '#C62828' }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868B', fontSize: 14 }}>
            Cargando turnos...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.15fr', gap: 16, alignItems: 'start' }}>
            {/* Left: turnos del día */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12 }}>
                Turnos de hoy
              </div>

              {turnos.length === 0 ? (
                <div style={{ color: '#86868B', fontSize: 13, padding: '8px 0' }}>
                  No hay turnos registrados hoy.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {turnos.map((t) => {
                    const col = COLOR_ESTADO[t.estado] ?? COLOR_ESTADO.cerrado;
                    return (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: '#E7F0FE', color: '#0071E3',
                          fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                          fontWeight: 700, fontSize: 11,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {iniciales(t.profesional_nombre)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.profesional_nombre}</div>
                          <div style={{ fontSize: 11.5, color: '#86868B' }}>
                            {ETIQUETA_TURNO[t.tipo] ?? t.tipo} ·{' '}
                            {new Date(t.inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {t.fin
                              ? ` → ${new Date(t.fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                              : ' · en curso'}
                          </div>
                        </div>
                        <span style={{
                          background: col.bg, color: col.color,
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap',
                        }}>
                          {t.estado === 'activo' ? '● Activo' : t.estado === 'cerrado' ? 'Cerrado' : 'Traspasado'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Cierre de turno activo */}
              {turnoActivo && (
                <div style={{
                  marginTop: 14, border: '1.5px dashed #CFE0FB', borderRadius: 14,
                  padding: 14, textAlign: 'center', background: '#FAFBFE',
                }}>
                  <div style={{ fontSize: 12.5, color: '#48484A', fontWeight: 600 }}>Cerrar turno activo</div>
                  <div style={{ fontSize: 11.5, color: '#86868B', marginTop: 3 }}>Firma para traspasar al siguiente turno</div>
                  <button
                    onClick={() => void handleCerrarTurno(turnoActivo.id)}
                    disabled={cerrando === turnoActivo.id}
                    style={{
                      marginTop: 11, background: cerrando === turnoActivo.id ? '#AEAEB2' : '#0071E3',
                      color: '#fff', border: 'none',
                      fontWeight: 700, fontSize: 13, padding: 10, borderRadius: 11,
                      cursor: cerrando === turnoActivo.id ? 'not-allowed' : 'pointer',
                      width: '100%',
                    }}
                  >
                    {cerrando === turnoActivo.id ? 'Cerrando...' : 'Firmar y cerrar turno'}
                  </button>
                </div>
              )}
            </div>

            {/* Right: traspaso IA */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(150deg,#1D1D1F,#0FB5A6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                  fontWeight: 700, color: '#fff', fontSize: 10,
                }}>IA</div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Traspaso de turno</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#86868B' }}>resumen automático</span>
              </div>

              {turnoActivo?.traspaso_resumen ? (
                <div style={{ background: '#F5F5F7', borderRadius: 12, padding: 13, fontSize: 12.5, color: '#48484A', lineHeight: 1.6 }}>
                  {turnoActivo.traspaso_resumen}
                </div>
              ) : (
                <div style={{ background: '#F5F5F7', borderRadius: 12, padding: 13, fontSize: 12.5, color: '#48484A', lineHeight: 1.6 }}>
                  {turnos.length === 0
                    ? 'No hay turnos activos. Inicie un turno para ver el resumen de traspaso.'
                    : 'El resumen de traspaso se generará automáticamente al cerrar el turno.'}
                </div>
              )}

              <div style={{ marginTop: 12, fontSize: 11, color: '#AEAEB2', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Resumen generado por IA · revíselo antes de traspasar
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
