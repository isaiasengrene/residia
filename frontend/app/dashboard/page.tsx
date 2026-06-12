'use client';

// W2: Dashboard - Inicio · panel general
import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import Link from 'next/link';
import { api } from '../../lib/api';
import { obtenerUsuario } from '../../lib/auth';

interface IncidenciaResumen {
  id: string;
  tipo: string;
  residente_id: string | null;
  prioridad: 'alta' | 'media' | 'baja';
  estado: string;
  created_at: string;
  informa: string | null;
}

interface EstadoAuditoria {
  integra: boolean;
  registros: number;
  roturas: number[];
}

const PRIORIDAD_COLOR: Record<string, string> = {
  alta: '#FF3B30',
  media: '#FF9500',
  baja: '#34C759',
};

export default function DashboardPage() {
  const [incidencias, setIncidencias] = useState<IncidenciaResumen[]>([]);
  const [auditoria, setAuditoria] = useState<EstadoAuditoria | null>(null);
  const [cargando, setCargando] = useState(true);
  const usuario = obtenerUsuario();

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [inc, aud] = await Promise.all([
          api.incidencias.listar() as Promise<IncidenciaResumen[]>,
          api.auditoria.verificar(),
        ]);
        setIncidencias(inc);
        setAuditoria(aud);
      } catch {
        // Si falla (p.ej. sin token en previsualización) dejamos los valores vacíos
      } finally {
        setCargando(false);
      }
    }
    void cargarDatos();
  }, []);

  const totalHoy = incidencias.length;
  const altaPrioridad = incidencias.filter(i => i.prioridad === 'alta').length;
  const pendientes = incidencias.filter(i => i.estado === 'abierta').length;

  const actividadReciente = incidencias.slice(0, 4).map(inc => ({
    color: PRIORIDAD_COLOR[inc.prioridad] ?? '#86868B',
    name: inc.informa ?? 'Sin informante',
    desc: inc.tipo,
    time: new Date(inc.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  }));

  const nombreUsuario = usuario?.nombre ?? 'Usuario';

  const ahora = new Date();
  const fechaStr = ahora.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, opacity: cargando ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>
              {cargando ? 'Cargando…' : `Buenos días, ${nombreUsuario.split(' ')[0]}`}
            </div>
            <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
              {fechaStr} · Residencia Federico Ozanam
            </div>
          </div>
          <div style={{
            fontSize: 12,
            color: auditoria?.integra === false ? '#FF3B30' : '#34C759',
            background: auditoria?.integra === false ? '#FDECEC' : '#E8F2EC',
            padding: '6px 12px', borderRadius: 999, fontWeight: 600,
          }}>
            {auditoria?.integra === false
              ? `⚠ ${auditoria.roturas.length} roturas en auditoría`
              : '● 4 agentes IA activos'}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Incidencias hoy</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5 }}>
              {cargando ? '…' : totalHoy}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Prioridad alta</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#FF3B30' }}>
              {cargando ? '…' : altaPrioridad}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Pendientes</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#FF9500' }}>
              {cargando ? '…' : pendientes}
            </div>
          </div>
          <div style={{
            background: 'linear-gradient(150deg,#1D1D1F,#0071E3)', border: 'none',
            borderRadius: 18, padding: 14, flex: 1, color: '#fff',
          }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Registros auditados</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5 }}>
              {cargando ? '…' : (auditoria?.registros ?? '—')}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          {/* Actividad reciente */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 15 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 11 }}>Actividad reciente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actividadReciente.length === 0 && !cargando ? (
                <div style={{ fontSize: 12.5, color: '#AEAEB2' }}>Sin incidencias recientes</div>
              ) : (
                actividadReciente.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }}></span>
                    <span style={{ fontSize: 12.5, flex: 1 }}><b>{item.name}</b> · {item.desc}</span>
                    <span style={{ fontSize: 11, color: '#AEAEB2' }}>{item.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Agentes IA */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 15 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 11 }}>Agentes IA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12.5 }}>
              {[
                { label: 'Registro unificado', status: '● activo', color: '#34C759' },
                { label: 'Comunic. familiares', status: '● activo', color: '#34C759' },
                { label: 'Seguimientos', status: '● activo', color: '#34C759' },
                { label: 'Valoraciones PAI', status: '● en pruebas', color: '#FF9500' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 600 }}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { href: '/incidencias', label: 'Ver libro de incidencias' },
            { href: '/seguimientos', label: 'Seguimientos IA' },
            { href: '/familiares', label: 'Comunicación familiares' },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{
              background: '#fff', border: '1px solid #E5E5EA', borderRadius: 10,
              padding: '8px 14px', fontSize: 13, color: '#0071E3', fontWeight: 600,
            }}>
              {item.label} →
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
