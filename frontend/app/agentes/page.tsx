// W9: Configuración de Agentes IA
import AppLayout from '../components/AppLayout';

const agentes = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="3" width="6" height="11" rx="3" fill="#0071E3"/>
        <path d="M6 11a6 6 0 0 0 12 0" stroke="#0071E3" strokeWidth="2"/>
      </svg>
    ),
    iconBg: '#E7F0FE',
    nombre: 'Registro Unificado',
    sub: 'Incidencias por voz/texto',
    desc: 'Solo personal autorizado. Genera alertas internas automáticas.',
    info: 'Última actividad: hace 2 min · 18 registros hoy',
    active: true,
    infoColor: '#AEAEB2',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="#0FB5A6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    iconBg: '#E4F7F4',
    nombre: 'Comunicación Familiares',
    sub: 'Mensajes de evolución',
    desc: 'Redacta borradores. Requiere aprobación humana antes de enviar.',
    info: 'Última actividad: hace 1 h · 6 mensajes hoy',
    active: true,
    infoColor: '#AEAEB2',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3 8-8M21 12a9 9 0 1 1-6.2-8.5" stroke="#AF52DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    iconBg: '#EFEAFB',
    nombre: 'Seguimientos IA',
    sub: 'Resumen y prioridad',
    desc: 'Clasifica entradas por relevancia clínica. Evita lectura innecesaria.',
    info: 'Última actividad: hace 10 min',
    active: true,
    infoColor: '#AEAEB2',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h16M4 17h10" stroke="#FF9500" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    iconBg: '#FBF0DC',
    nombre: 'Valoraciones (PAI)',
    sub: 'Versionado automático',
    desc: 'En pruebas. Guarda histórico y compara versiones del PAI.',
    info: '● Fase de pruebas',
    active: false,
    infoColor: '#FF9500',
  },
];

export default function AgentesPage() {
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          {agentes.map((agente, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 15,
              opacity: agente.active ? 1 : 0.92,
            }}>
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
                <div style={{
                  width: 40, height: 23, borderRadius: 999,
                  background: agente.active ? '#34C759' : '#D7DEE6',
                  position: 'relative', cursor: 'pointer', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', width: 18, height: 18, borderRadius: '50%',
                    background: '#fff', top: 2.5,
                    right: agente.active ? 2.5 : 'auto',
                    left: agente.active ? 'auto' : 2.5,
                  }}></div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 11, lineHeight: 1.5 }}>{agente.desc}</div>
              <div style={{ fontSize: 11, color: agente.infoColor, marginTop: 9, fontWeight: agente.active ? 400 : 600 }}>
                {agente.info}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
