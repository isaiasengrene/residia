// W6: Comunicación con Familiares
import AppLayout from '../components/AppLayout';

const familias = [
  {
    initials: 'MG', bgColor: '#E7F0FE', textColor: '#0071E3',
    nombre: 'Familia de María Gil', rel: 'Hija · WhatsApp',
    estado: 'Revisar', estColor: '#FF9500', estBg: '#FBF0DC',
    active: true,
  },
  {
    initials: 'JF', bgColor: '#E4F7F4', textColor: '#0FB5A6',
    nombre: 'Familia de Juan Ferrer', rel: 'Hijo · WhatsApp',
    estado: 'Enviado', estColor: '#34C759', estBg: '#E8F2EC',
    active: false,
  },
  {
    initials: 'PN', bgColor: '#FBEEDD', textColor: '#FF9500',
    nombre: 'Familia de Pilar Navarro', rel: 'Sobrina · WhatsApp',
    estado: 'Enviado', estColor: '#34C759', estBg: '#E8F2EC',
    active: false,
  },
];

export default function FamiliaresPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
          }}>Comunicación con Familiares</div>
          <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
            La IA redacta mensajes de evolución desde el Libro Digital · el equipo revisa y envía
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.1fr', gap: 16 }}>
          {/* Left: family list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {familias.map((f, i) => (
              <div key={i} style={{
                background: '#fff',
                border: f.active ? '1.5px solid #0071E3' : '1px solid #ECECF0',
                borderRadius: 18, padding: 13,
                boxShadow: f.active ? '0 4px 12px rgba(31,111,229,.1)' : 'none',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: f.bgColor, color: f.textColor,
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{f.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{f.nombre}</div>
                    <div style={{ fontSize: 11.5, color: '#86868B' }}>{f.rel}</div>
                  </div>
                  <span style={{
                    background: f.estBg, color: f.estColor,
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                  }}>{f.estado}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: message preview */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 15, padding: 17 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(150deg,#1D1D1F,#0FB5A6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                fontWeight: 700, color: '#fff', fontSize: 11,
              }}>IA</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Mensaje generado por la IA</div>
                <div style={{ fontSize: 11, color: '#86868B' }}>para la hija de María Gil</div>
              </div>
            </div>

            <div style={{ background: '#F2F2F7', borderRadius: 20, padding: 13 }}>
              <div style={{
                background: '#D8ECFF', borderRadius: '20px 14px 14px 4px',
                padding: '11px 13px', fontSize: 13, lineHeight: 1.5, color: '#1D1D1F',
              }}>
                Buenas tardes 😊 Le escribimos de la residencia. Hoy María ha participado en{' '}
                <b>terapia ocupacional</b> y ha realizado ejercicios de movilidad con buena evolución.
                Ha comido bien y está de buen ánimo. Un saludo del equipo.
              </div>
              <div style={{ fontSize: 10.5, color: '#86868B', textAlign: 'right', marginTop: 5 }}>
                borrador · 17:20
              </div>
            </div>

            <div style={{
              marginTop: 12, background: '#F5F5F7',
              borderLeft: '3px solid #0FB5A6', borderRadius: 8,
              padding: '9px 11px', fontSize: 11.5, color: '#6E6E73', lineHeight: 1.45,
            }}>
              <b>Fuente:</b> Libro Digital de hoy — actividad: terapia ocupacional · comida: completa · ánimo: bueno.
            </div>

            <div style={{ display: 'flex', gap: 9, marginTop: 13 }}>
              <div style={{
                flex: 1, background: '#34C759', color: '#fff', textAlign: 'center',
                fontWeight: 700, fontSize: 13, padding: 11, borderRadius: 11, cursor: 'pointer',
              }}>Aprobar y enviar</div>
              <div style={{
                border: '1.5px solid #E0E6EC', color: '#6E6E73', fontWeight: 600,
                fontSize: 13, padding: '11px 16px', borderRadius: 11, cursor: 'pointer',
              }}>Editar</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
