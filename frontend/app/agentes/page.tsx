'use client';
// W9: Configuración de Agentes IA
import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { api } from '../../lib/api';

interface ModeloIa {
  id: string;
  proveedor: string;
  modelo: string;
  tipo_agente: string;
  activo: boolean;
  created_at: string;
}

interface AgenteConfig {
  nombre: string;
  sub: string;
  desc: string;
  tipo: string;
  icon: React.ReactNode;
  iconBg: string;
}

const AGENTES_CONFIG: AgenteConfig[] = [
  {
    nombre: 'Registro Unificado',
    sub: 'Incidencias por voz/texto',
    desc: 'Solo personal autorizado. Genera alertas internas automáticas.',
    tipo: 'registro',
    iconBg: '#E7F0FE',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="3" width="6" height="11" rx="3" fill="#0071E3"/>
        <path d="M6 11a6 6 0 0 0 12 0" stroke="#0071E3" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    nombre: 'Comunicación Familiares',
    sub: 'Mensajes de evolución',
    desc: 'Redacta borradores. Requiere aprobación humana antes de enviar.',
    tipo: 'comunicacion_familiar',
    iconBg: '#E4F7F4',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="#0FB5A6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nombre: 'Seguimientos IA',
    sub: 'Resumen y prioridad',
    desc: 'Clasifica entradas por relevancia clínica. Evita lectura innecesaria.',
    tipo: 'seguimiento',
    iconBg: '#EFEAFB',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3 8-8M21 12a9 9 0 1 1-6.2-8.5" stroke="#AF52DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    nombre: 'Valoraciones (PAI)',
    sub: 'Versionado automático',
    desc: 'En pruebas. Guarda histórico y compara versiones del PAI.',
    tipo: 'pai',
    iconBg: '#FBF0DC',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h16M4 17h10" stroke="#FF9500" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function AgentesPage() {
  const [modelos, setModelos] = useState<ModeloIa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activando, setActivando] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const lista = await api.modelosIa.listar() as ModeloIa[];
        setModelos(lista);
      } catch {
        setError('No se pudieron cargar los modelos de IA. Verifique su conexión.');
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

  const modeloPorTipo = (tipo: string): ModeloIa | undefined => {
    return modelos.find((m) => m.tipo_agente === tipo && m.activo)
      ?? modelos.find((m) => m.tipo_agente === tipo);
  };

  const handleToggle = async (modelo: ModeloIa | undefined) => {
    if (!modelo) return;
    setActivando(modelo.id);
    try {
      if (modelo.activo) {
        await api.modelosIa.desactivar(modelo.id);
      } else {
        await api.modelosIa.activar(modelo.id);
      }
      const lista = await api.modelosIa.listar() as ModeloIa[];
      setModelos(lista);
    } catch {
      alert('Error al cambiar el estado del modelo. Inténtelo de nuevo.');
    } finally {
      setActivando(null);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 15 }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
          }}>Agentes de Inteligencia Artificial</div>
          <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
            Activa, configura y controla quién puede usar cada agente
          </div>
        </div>

        {error && (
          <div style={{ background: '#FDECEC', border: '1px solid #FFCDD2', borderRadius: 11, padding: '10px 15px', marginBottom: 14, fontSize: 13, color: '#C62828' }}>
            {error}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#86868B', fontSize: 14 }}>
            Cargando configuración de agentes...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            {AGENTES_CONFIG.map((agente) => {
              const modelo = modeloPorTipo(agente.tipo);
              const activo = modelo?.activo ?? false;
              const cargandoToggle = activando === modelo?.id;

              return (
                <div
                  key={agente.tipo}
                  style={{
                    background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 15,
                    opacity: activo ? 1 : 0.92,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 11 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: agente.iconBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{agente.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{agente.nombre}</div>
                        <div style={{ fontSize: 11.5, color: '#86868B' }}>{agente.sub}</div>
                      </div>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={() => void handleToggle(modelo)}
                      disabled={cargandoToggle || !modelo}
                      aria-label={activo ? 'Desactivar agente' : 'Activar agente'}
                      style={{
                        width: 40, height: 23, borderRadius: 999,
                        background: activo ? '#34C759' : '#D7DEE6',
                        position: 'relative', cursor: modelo ? 'pointer' : 'default',
                        border: 'none', flexShrink: 0, padding: 0,
                      }}
                    >
                      <div style={{
                        position: 'absolute', width: 18, height: 18, borderRadius: '50%',
                        background: '#fff', top: 2.5,
                        right: activo ? 2.5 : 'auto',
                        left: activo ? 'auto' : 2.5,
                        transition: 'left 0.15s, right 0.15s',
                      }}></div>
                    </button>
                  </div>

                  <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 11, lineHeight: 1.5 }}>{agente.desc}</div>

                  {modelo ? (
                    <div style={{ marginTop: 9, fontSize: 11, color: activo ? '#AEAEB2' : '#FF9500', fontWeight: activo ? 400 : 600 }}>
                      {activo
                        ? `Activo · ${modelo.proveedor} / ${modelo.modelo}`
                        : `Inactivo · ${modelo.proveedor} / ${modelo.modelo}`}
                    </div>
                  ) : (
                    <div style={{ marginTop: 9, fontSize: 11, color: '#FF9500', fontWeight: 600 }}>
                      ● Sin modelo configurado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
