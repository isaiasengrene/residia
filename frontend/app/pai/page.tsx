'use client';
// W8: Valoraciones (PAI) · versiones
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { api } from '../../lib/api';

interface PaiItem {
  id: string;
  residente_id: string;
  version: number;
  estado: 'borrador' | 'revision' | 'aprobado' | 'archivado';
  contenido: Record<string, unknown>;
  borrador_ia: boolean;
  aprobado_por: string | null;
  aprobado_en: string | null;
  proxima_revision: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Residente {
  id: string;
  nombre: string;
  apellidos: string;
}

const ETIQUETA_ESTADO: Record<string, string> = {
  borrador: 'Borrador',
  revision: 'En revisión',
  aprobado: 'Aprobado',
  archivado: 'Archivado',
};

const COLOR_ESTADO: Record<string, { bg: string; color: string }> = {
  borrador:  { bg: '#F5F5F7', color: '#6E6E73' },
  revision:  { bg: '#FBF0DC', color: '#9A6410' },
  aprobado:  { bg: '#E8F7EF', color: '#248A3D' },
  archivado: { bg: '#F5F5F7', color: '#AEAEB2' },
};

export default function PaiPage() {
  const [paiList, setPaiList] = useState<PaiItem[]>([]);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [seleccionado, setSeleccionado] = useState<PaiItem | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [mensajeIA, setMensajeIA] = useState<string | null>(null);
  const [aprobando, setAprobando] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [pais, res] = await Promise.all([
        api.pai.listar(),
        api.residentes.listar(),
      ]);
      const listaTyped = pais as PaiItem[];
      setPaiList(listaTyped);
      setResidentes(res as Residente[]);
      if (listaTyped.length > 0 && !seleccionado) {
        setSeleccionado(listaTyped[0]);
      }
    } catch (err) {
      setError('No se pudieron cargar los planes de atención. Verifique su conexión.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, [seleccionado]);

  useEffect(() => {
    void cargarDatos();
  }, []);

  const nombreResidente = (residenteId: string): string => {
    const r = residentes.find((x) => x.id === residenteId);
    return r ? `${r.nombre} ${r.apellidos}` : 'Residente desconocido';
  };

  const handleGenerarIA = async (residenteId: string) => {
    setGenerandoIA(true);
    setMensajeIA(null);
    try {
      const resp = await api.pai.generarIA(residenteId) as { jobId: string; mensaje: string };
      setMensajeIA(resp.mensaje ?? 'El borrador se está generando...');
      setTimeout(() => {
        void cargarDatos();
        setMensajeIA(null);
      }, 4000);
    } catch {
      setMensajeIA('Error al encolar la generación. Inténtelo de nuevo.');
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleAprobar = async (id: string) => {
    setAprobando(id);
    try {
      await api.pai.aprobar(id);
      await cargarDatos();
    } catch {
      alert('Error al aprobar el PAI. Inténtelo de nuevo.');
    } finally {
      setAprobando(null);
    }
  };

  const paiActivo = paiList.filter((p) => p.estado !== 'archivado');
  const paiArchivados = paiList.filter((p) => p.estado === 'archivado');

  // Obtener primer residente disponible para generación IA
  const primerResidenteId = residentes[0]?.id ?? '';

  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Valoraciones PAI</div>
            <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
              Plan de Atención Individualizada · histórico de versiones automático
            </div>
          </div>
          <button
            onClick={() => primerResidenteId && void handleGenerarIA(primerResidenteId)}
            disabled={generandoIA || !primerResidenteId}
            style={{
              background: generandoIA ? '#AEAEB2' : '#0071E3',
              color: '#fff',
              fontWeight: 700, fontSize: 13, padding: '10px 15px', borderRadius: 11,
              cursor: generandoIA ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {generandoIA ? 'Generando...' : '+ Generar borrador IA'}
          </button>
        </div>

        {mensajeIA && (
          <div style={{
            background: '#E7F0FE', border: '1px solid #CFE0FB', borderRadius: 11,
            padding: '10px 15px', marginBottom: 14, fontSize: 13, color: '#0071E3',
          }}>
            {mensajeIA}
          </div>
        )}

        {error && (
          <div style={{
            background: '#FDECEC', border: '1px solid #FFCDD2', borderRadius: 11,
            padding: '10px 15px', marginBottom: 14, fontSize: 13, color: '#C62828',
          }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868B', fontSize: 14 }}>
            Cargando planes de atención...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 16 }}>
            {/* Version list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {paiList.length === 0 && (
                <div style={{ color: '#86868B', fontSize: 13, padding: 12 }}>
                  No hay planes de atención registrados.
                </div>
              )}
              {paiActivo.map((p) => {
                const activo = seleccionado?.id === p.id;
                const colores = COLOR_ESTADO[p.estado] ?? COLOR_ESTADO.borrador;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSeleccionado(p)}
                    style={{
                      background: '#fff',
                      border: activo ? '1.5px solid #0071E3' : '1px solid #ECECF0',
                      borderRadius: 16, padding: 13, cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: activo ? 700 : 600, fontSize: 13.5 }}>
                        Versión {p.version}{p.borrador_ia ? ' · IA' : ''}
                      </span>
                      <span style={{
                        background: colores.bg, color: colores.color,
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                      }}>{ETIQUETA_ESTADO[p.estado]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#48484A', marginTop: 4, fontWeight: 600 }}>
                      {nombreResidente(p.residente_id)}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#86868B', marginTop: 2 }}>
                      {new Date(p.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </div>
                    {(p.estado === 'borrador' || p.estado === 'revision') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); void handleAprobar(p.id); }}
                        disabled={aprobando === p.id}
                        style={{
                          marginTop: 8, background: '#E8F7EF', color: '#248A3D',
                          border: 'none', borderRadius: 8, padding: '5px 10px',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%',
                        }}
                      >
                        {aprobando === p.id ? 'Aprobando...' : 'Aprobar'}
                      </button>
                    )}
                  </div>
                );
              })}
              {paiArchivados.length > 0 && (
                <div style={{ fontSize: 11, color: '#AEAEB2', fontWeight: 700, padding: '4px 0 2px', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Archivados ({paiArchivados.length})
                </div>
              )}
              {paiArchivados.map((p) => {
                const activo = seleccionado?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSeleccionado(p)}
                    style={{
                      background: '#fff', opacity: 0.6,
                      border: activo ? '1.5px solid #AEAEB2' : '1px solid #ECECF0',
                      borderRadius: 16, padding: 13, cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#6E6E73' }}>
                      Versión {p.version} · archivado
                    </div>
                    <div style={{ fontSize: 11.5, color: '#AEAEB2', marginTop: 2 }}>
                      {new Date(p.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              {seleccionado ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 11 }}>
                    Versión {seleccionado.version} · {ETIQUETA_ESTADO[seleccionado.estado]}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>
                    {nombreResidente(seleccionado.residente_id)}
                  </div>
                  {seleccionado.borrador_ia && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11.5, color: '#0071E3' }}>
                      <span style={{ background: '#E7F0FE', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>Generado por IA</span>
                      <span style={{ color: '#86868B' }}>· requiere revisión del equipo</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                    {Object.keys(seleccionado.contenido).length === 0 ? (
                      <div style={{ color: '#86868B', fontStyle: 'italic' }}>Sin contenido registrado.</div>
                    ) : (
                      Object.entries(seleccionado.contenido).map(([clave, valor]) => (
                        <div key={clave} style={{ background: '#F5F5F7', borderLeft: '3px solid #0071E3', borderRadius: 6, padding: '8px 11px' }}>
                          <b style={{ textTransform: 'capitalize' }}>{clave}:</b>{' '}
                          {typeof valor === 'string' ? valor : JSON.stringify(valor)}
                        </div>
                      ))
                    )}
                  </div>
                  {seleccionado.proxima_revision && (
                    <div style={{ marginTop: 12, fontSize: 11.5, color: '#FF9500', fontWeight: 600 }}>
                      Próxima revisión: {new Date(seleccionado.proxima_revision).toLocaleDateString('es-ES')}
                    </div>
                  )}
                  {seleccionado.aprobado_en && (
                    <div style={{ marginTop: 6, fontSize: 11.5, color: '#248A3D' }}>
                      Aprobado el {new Date(seleccionado.aprobado_en).toLocaleDateString('es-ES')}
                    </div>
                  )}
                  <div style={{ marginTop: 13, fontSize: 11.5, color: '#AEAEB2', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#AEAEB2" strokeWidth="1.8"/>
                    </svg>
                    Histórico íntegro guardado · sin descargas ni subidas manuales
                  </div>
                </>
              ) : (
                <div style={{ color: '#86868B', fontSize: 13, padding: 12 }}>
                  Seleccione un PAI para ver su contenido.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
