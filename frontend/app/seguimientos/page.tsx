'use client';
// W5: Seguimientos Inteligentes
import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { api } from '../../lib/api';

interface Residente {
  id: string;
  nombre: string;
  apellidos: string;
  habitacion?: string;
}

interface SeguimientoIA {
  resumen_ejecutivo?: string;
  patrones_detectados?: string[];
  tendencia?: 'mejora' | 'estable' | 'deterioro';
  alertas?: string[];
  relevancia?: 'alta' | 'media' | 'baja';
}

interface SeguimientoLocal {
  residente: Residente;
  analisis: SeguimientoIA | null;
  analizando: boolean;
  error: string | null;
}

const COLORES_RELEVANCIA: Record<string, { color: string; bg: string; label: string }> = {
  alta:   { color: '#FF3B30', bg: '#FDECEC', label: 'Relevancia alta' },
  media:  { color: '#FF9500', bg: '#FBF0DC', label: 'Relevancia media' },
  baja:   { color: '#34C759', bg: '#E8F7EF', label: 'Relevancia baja' },
};

const COLORES_TENDENCIA: Record<string, { color: string; label: string }> = {
  mejora:     { color: '#34C759', label: 'Mejora' },
  estable:    { color: '#0071E3', label: 'Estable' },
  deterioro:  { color: '#FF3B30', label: 'Deterioro' },
};

export default function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState<SeguimientoLocal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<string>('todos');

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const residentes = await api.residentes.listar() as Residente[];
        setSeguimientos(
          residentes.map((r) => ({
            residente: r,
            analisis: null,
            analizando: false,
            error: null,
          })),
        );
      } catch {
        console.error('Error al cargar residentes para seguimientos');
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

  const analizar = async (residenteId: string) => {
    setSeguimientos((prev) =>
      prev.map((s) =>
        s.residente.id === residenteId
          ? { ...s, analizando: true, error: null }
          : s,
      ),
    );
    try {
      const resultado = await api.agentesIA.seguimiento(residenteId) as SeguimientoIA;
      setSeguimientos((prev) =>
        prev.map((s) =>
          s.residente.id === residenteId
            ? { ...s, analisis: resultado, analizando: false }
            : s,
        ),
      );
    } catch {
      setSeguimientos((prev) =>
        prev.map((s) =>
          s.residente.id === residenteId
            ? { ...s, analizando: false, error: 'No se pudo obtener el análisis.' }
            : s,
        ),
      );
    }
  };

  const filtros = ['todos', 'alta', 'media', 'baja'];
  const etiquetaFiltro = (f: string) => {
    if (f === 'todos') return 'Todos';
    return COLORES_RELEVANCIA[f]?.label ?? f;
  };

  const seguimientosFiltrados = filtro === 'todos'
    ? seguimientos
    : seguimientos.filter((s) => s.analisis?.relevancia === filtro);

  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 6 }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
          }}>Seguimientos Inteligentes</div>
          <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
            La IA resume cada entrada y la prioriza por relevancia clínica
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, margin: '13px 0' }}>
          {filtros.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                background: filtro === f ? '#1D1D1F' : '#fff',
                color: filtro === f ? '#fff' : '#6E6E73',
                border: filtro === f ? 'none' : '1px solid #E5E5EA',
                fontSize: 12, fontWeight: filtro === f ? 600 : 400,
                padding: '6px 13px', borderRadius: 999, cursor: 'pointer',
              }}
            >
              {etiquetaFiltro(f)}
            </button>
          ))}
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868B', fontSize: 14 }}>
            Cargando residentes...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            {seguimientosFiltrados.map((s) => {
              const rel = s.analisis?.relevancia
                ? COLORES_RELEVANCIA[s.analisis.relevancia]
                : null;
              const tend = s.analisis?.tendencia
                ? COLORES_TENDENCIA[s.analisis.tendencia]
                : null;

              return (
                <div
                  key={s.residente.id}
                  style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 15 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      {s.residente.nombre} {s.residente.apellidos}
                      {s.residente.habitacion ? ` · Hab. ${s.residente.habitacion}` : ''}
                    </span>
                    {rel && (
                      <span style={{
                        background: rel.bg, color: rel.color,
                        fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                      }}>{rel.label}</span>
                    )}
                  </div>

                  {s.analisis ? (
                    <>
                      <div style={{
                        fontSize: 12.5, color: '#424245', lineHeight: 1.5,
                        background: '#FAFAFC', borderLeft: '3px solid #0FB5A6',
                        borderRadius: 7, padding: '9px 11px',
                      }}>
                        <b>Resumen IA:</b> {s.analisis.resumen_ejecutivo ?? 'Sin resumen disponible.'}
                      </div>
                      {s.analisis.alertas && s.analisis.alertas.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {s.analisis.alertas.map((alerta, i) => (
                            <div key={i} style={{ fontSize: 11.5, color: '#FF3B30', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B30', flexShrink: 0 }}></span>
                              {alerta}
                            </div>
                          ))}
                        </div>
                      )}
                      {tend && (
                        <div style={{ marginTop: 8, fontSize: 11.5, color: tend.color, fontWeight: 600 }}>
                          Tendencia: {tend.label}
                        </div>
                      )}
                    </>
                  ) : s.error ? (
                    <div style={{ fontSize: 12, color: '#FF3B30', marginBottom: 8 }}>{s.error}</div>
                  ) : (
                    <div style={{
                      fontSize: 12.5, color: '#86868B',
                      background: '#FAFAFC', borderLeft: '3px solid #E5E5EA',
                      borderRadius: 7, padding: '9px 11px', marginBottom: 8,
                    }}>
                      Sin análisis. Pulse &quot;Analizar&quot; para generar un seguimiento IA.
                    </div>
                  )}

                  <button
                    onClick={() => void analizar(s.residente.id)}
                    disabled={s.analizando}
                    style={{
                      marginTop: 10, width: '100%',
                      background: s.analizando ? '#F5F5F7' : '#E7F0FE',
                      color: s.analizando ? '#86868B' : '#0071E3',
                      border: 'none', borderRadius: 9,
                      padding: '8px 0', fontSize: 12, fontWeight: 700,
                      cursor: s.analizando ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {s.analizando ? 'Analizando...' : 'Analizar'}
                  </button>
                </div>
              );
            })}

            {seguimientosFiltrados.length === 0 && !cargando && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#86868B', padding: 30, fontSize: 13 }}>
                No hay residentes con esta relevancia analizada todavía.
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
