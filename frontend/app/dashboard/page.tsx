// W2: Dashboard - Inicio · panel general
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Buenos días, Laura</div>
            <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
              Jueves 12 jun 2026 · Residencia Federico Ozanam
            </div>
          </div>
          <div style={{
            fontSize: 12, color: '#34C759', background: '#E8F2EC',
            padding: '6px 12px', borderRadius: 999, fontWeight: 600,
          }}>● 4 agentes IA activos</div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Incidencias hoy</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5 }}>18</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Prioridad alta</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#FF3B30' }}>3</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Pendientes</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#FF9500' }}>5</div>
          </div>
          <div style={{
            background: 'linear-gradient(150deg,#1D1D1F,#0071E3)', border: 'none',
            borderRadius: 18, padding: 14, flex: 1, color: '#fff',
          }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Tiempo medio registro</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5 }}>12 s</div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          {/* Actividad reciente */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 15 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 11 }}>Actividad reciente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { color: '#FF3B30', name: 'Dolores Gómez', desc: 'caída sin lesión', time: '10:41' },
                { color: '#FF9500', name: 'Antonio Ferrer', desc: 'rechazo medicación', time: '10:12' },
                { color: '#FF9500', name: 'Pilar Navarro', desc: 'no ha desayunado', time: '09:48' },
                { color: '#34C759', name: 'Rosa Iglesias', desc: 'buen ánimo, paseo', time: '07:55' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }}></span>
                  <span style={{ fontSize: 12.5, flex: 1 }}><b>{item.name}</b> · {item.desc}</span>
                  <span style={{ fontSize: 11, color: '#AEAEB2' }}>{item.time}</span>
                </div>
              ))}
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
