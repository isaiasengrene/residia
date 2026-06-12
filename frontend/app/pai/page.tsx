// W8: Valoraciones (PAI) · versiones
import AppLayout from '../components/AppLayout';

export default function PaiPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Valoración PAI · Dolores Gómez</div>
            <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
              Plan de Atención Individualizada · histórico de versiones automático
            </div>
          </div>
          <div style={{
            background: '#0071E3', color: '#fff',
            fontWeight: 700, fontSize: 13, padding: '10px 15px', borderRadius: 11, cursor: 'pointer',
          }}>+ Generar nueva versión</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 16 }}>
          {/* Version list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { version: 'Versión 3 · actual', date: '12 jun 2026 · generada por IA', active: true },
              { version: 'Versión 2', date: '14 mar 2026', active: false },
              { version: 'Versión 1', date: '02 mar 2024 · ingreso', active: false },
            ].map((v, i) => (
              <div key={i} style={{
                background: '#fff',
                border: v.active ? '1.5px solid #0071E3' : '1px solid #ECECF0',
                borderRadius: 16, padding: 13, cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: v.active ? 700 : 600, fontSize: 13.5 }}>{v.version}</span>
                  {v.active
                    ? <span style={{ background: '#E7F0FE', color: '#0071E3', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>Vigente</span>
                    : <span style={{ fontSize: 11, color: '#0071E3', fontWeight: 600 }}>comparar</span>
                  }
                </div>
                <div style={{ fontSize: 11.5, color: '#86868B', marginTop: 4 }}>{v.date}</div>
              </div>
            ))}
          </div>

          {/* Changes panel */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 11 }}>
              Cambios v2 → v3
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
              <div style={{ background: '#E8F7EF', borderLeft: '3px solid #34C759', borderRadius: 6, padding: '8px 11px' }}>
                <b style={{ color: '#248A3D' }}>+ Añadido:</b> vigilancia de movilidad 48h tras caída del 12 jun.
              </div>
              <div style={{ background: '#FBF4E6', borderLeft: '3px solid #FF9500', borderRadius: 6, padding: '8px 11px' }}>
                <b style={{ color: '#9A6410' }}>~ Modificado:</b> dieta basal → triturada por dificultad de deglución.
              </div>
              <div style={{ background: '#FBF4E6', borderLeft: '3px solid #FF9500', borderRadius: 6, padding: '8px 11px' }}>
                <b style={{ color: '#9A6410' }}>~ Modificado:</b> objetivo de movilidad: marcha con apoyo → con andador.
              </div>
              <div style={{ background: '#F5F5F7', borderLeft: '3px solid #C7C7CC', borderRadius: 6, padding: '8px 11px', color: '#6E6E73' }}>
                Sin cambios en medicación ni en plan psicosocial.
              </div>
            </div>
            <div style={{ marginTop: 13, fontSize: 11.5, color: '#AEAEB2', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#AEAEB2" strokeWidth="1.8"/>
              </svg>
              Histórico íntegro guardado · sin descargas ni subidas manuales
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
