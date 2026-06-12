// W13: Turnos · firma + traspaso por IA
import AppLayout from '../components/AppLayout';

export default function TurnosPage() {
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
          <span style={{ fontSize: 12, color: '#34C759', background: '#E8F7EF', padding: '6px 12px', borderRadius: 999, fontWeight: 600 }}>
            ● Turno de mañana en curso
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.15fr', gap: 16, alignItems: 'start' }}>
          {/* Left: current turn */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12 }}>
              Turno actual · Planta 1
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { initials: 'MR', bg: '#E7F0FE', color: '#0071E3', nombre: 'Marta Ruiz · auxiliar', sub: 'Inicio 07:00 · firma ✓' },
                { initials: 'LG', bg: '#E4F7F4', color: '#0FB5A6', nombre: 'Lucía G. · enfermera', sub: 'Inicio 07:00 · firma ✓' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: p.bg, color: p.color,
                    fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                    fontWeight: 700, fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{p.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.nombre}</div>
                    <div style={{ fontSize: 11.5, color: '#86868B' }}>{p.sub}</div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#34C759" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ))}
            </div>

            {/* Sign out */}
            <div style={{
              marginTop: 14, border: '1.5px dashed #CFE0FB', borderRadius: 14,
              padding: 14, textAlign: 'center', background: '#FAFBFE',
            }}>
              <div style={{ fontSize: 12.5, color: '#48484A', fontWeight: 600 }}>Cierre de turno (15:00)</div>
              <div style={{ fontSize: 11.5, color: '#86868B', marginTop: 3 }}>Firma para traspasar al turno de tarde</div>
              <div style={{
                marginTop: 11, background: '#0071E3', color: '#fff',
                fontWeight: 700, fontSize: 13, padding: 10, borderRadius: 11, cursor: 'pointer',
              }}>Firmar y cerrar turno</div>
            </div>
          </div>

          {/* Right: AI summary */}
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

            <div style={{ background: '#F5F5F7', borderRadius: 12, padding: 13, fontSize: 12.5, color: '#48484A', lineHeight: 1.6 }}>
              Turno sin incidencias urgentes. <b>3 incidencias</b> registradas: caída sin lesión (Dolores G., atendida),
              rechazo de medicación (Antonio F., en seguimiento) y falta de apetito (Pilar N.).{' '}
              <b>Pendiente turno tarde:</b> vigilar movilidad de Dolores G. 48h y revisar ingesta de Pilar N. en la cena.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {[
                { color: '#FF9500', text: 'Vigilar movilidad · Dolores Gómez (48h)' },
                { color: '#FF9500', text: 'Revisar ingesta en cena · Pilar Navarro' },
                { color: '#34C759', text: 'Medicación pautada al día' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }}></span>
                  {item.text}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: '#AEAEB2', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Resumen generado por IA · revíselo antes de traspasar
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
