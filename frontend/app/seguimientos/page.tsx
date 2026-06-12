// W5: Seguimientos Inteligentes
import AppLayout from '../components/AppLayout';

const seguimientos = [
  {
    nombre: 'Manuel Ortega · Hab. 9',
    relevancia: 'Relevancia alta',
    relColor: '#FF3B30', relBg: '#FDECEC',
    resumen: '3 episodios de desorientación nocturna esta semana. Patrón creciente. Sugiere revisión por psicología.',
    ultima: 'Última entrada hoy · 08:30',
  },
  {
    nombre: 'Antonio Ferrer · Hab. 5',
    relevancia: 'Relevancia media',
    relColor: '#FF9500', relBg: '#FBF0DC',
    resumen: '2 rechazos de medicación en 24h. Sin incidencias previas. Recomendado hablar con el residente.',
    ultima: 'Última entrada hoy · 10:12',
  },
  {
    nombre: 'Dolores Gómez · Hab. 12',
    relevancia: 'Relevancia alta',
    relColor: '#FF3B30', relBg: '#FDECEC',
    resumen: 'Caída sin lesión hoy. Primera del mes. Vigilar movilidad las próximas 48h.',
    ultima: 'Última entrada hoy · 10:41',
  },
  {
    nombre: 'Pilar Navarro · Hab. 7',
    relevancia: 'Relevancia media',
    relColor: '#FF9500', relBg: '#FBF0DC',
    resumen: 'Pérdida de apetito 2 días seguidos. Sugiere valorar con cocina y enfermería.',
    ultima: 'Última entrada hoy · 09:48',
  },
];

export default function SeguimientosPage() {
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
          {['Relevancia alta','Clínico','Conducta','Nutrición'].map((f, i) => (
            <span key={f} style={{
              background: i === 0 ? '#1D1D1F' : '#fff',
              color: i === 0 ? '#fff' : '#6E6E73',
              border: i === 0 ? 'none' : '1px solid #E5E5EA',
              fontSize: 12, fontWeight: i === 0 ? 600 : 400,
              padding: '6px 13px', borderRadius: 999, cursor: 'pointer',
            }}>{f}</span>
          ))}
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          {seguimientos.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{s.nombre}</span>
                <span style={{
                  background: s.relBg, color: s.relColor,
                  fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                }}>{s.relevancia}</span>
              </div>
              <div style={{
                fontSize: 12.5, color: '#424245', lineHeight: 1.5,
                background: '#FAFAFC', borderLeft: '3px solid #0FB5A6',
                borderRadius: 7, padding: '9px 11px',
              }}>
                <b>Resumen IA:</b> {s.resumen}
              </div>
              <div style={{ fontSize: 11, color: '#AEAEB2', marginTop: 8 }}>{s.ultima}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
