// W16: Panel de administración · cumplimiento
import AppLayout from '../components/AppLayout';

export default function AdminPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 15 }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
          }}>Cumplimiento del centro</div>
          <div style={{ fontSize: 13.5, color: '#86868B', marginTop: 3 }}>
            Fundación Federico Ozanam · estado normativo en tiempo real
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 15 }}>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Consentimientos activos</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5 }}>
              61<span style={{ fontSize: 15, color: '#AEAEB2' }}>/64</span>
            </div>
          </div>
          <div style={{ background: '#FFF9F0', border: '1px solid #FBE3C0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Por renovar (30d)</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#FF9500' }}>3</div>
          </div>
          <div style={{ background: '#FFF6F5', border: '1px solid #FBD2D0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Firmas pendientes</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#FF3B30' }}>2</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Brechas (90d)</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#34C759' }}>0</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
          {/* Alerts */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 11 }}>Alertas de cumplimiento</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                {
                  icon: <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
                  bg: '#FFF6F5', border: '#FBD2D0', text: '2 PAI con firma pendiente', action: 'Resolver', actionColor: '#FF3B30',
                },
                {
                  icon: <><circle cx="12" cy="12" r="9" stroke="#FF9500" strokeWidth="1.8"/><path d="M12 8v5l3 2" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round"/></>,
                  bg: '#FFF9F0', border: '#FBE3C0', text: '3 consentimientos caducan en 30 días', action: 'Renovar', actionColor: '#FF9500',
                },
                {
                  icon: <path d="M4 7h16M4 12h16M4 17h10" stroke="#0071E3" strokeWidth="1.8" strokeLinecap="round"/>,
                  bg: '#F5F9FF', border: '#D6E6FB', text: 'PAI de 1 residente > 6 meses sin revisar', action: 'Ver', actionColor: '#0071E3',
                },
              ].map((alert, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: alert.bg, border: `1px solid ${alert.border}`,
                  borderRadius: 11, padding: '10px 12px',
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    {alert.icon}
                  </svg>
                  <span style={{ fontSize: 12.5, flex: 1 }}>{alert.text}</span>
                  <span style={{ fontSize: 11, color: alert.actionColor, fontWeight: 600, cursor: 'pointer' }}>{alert.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {/* Legal docs */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 16, padding: 15 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Documentación legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                {[
                  { label: 'RAT', status: 'Actualizado' },
                  { label: 'EIPD', status: 'Vigente' },
                  { label: 'DPA Anthropic / Meta / AWS', status: 'Firmados' },
                  { label: 'Política ENS', status: 'Documentada' },
                ].map((doc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6E6E73' }}>{doc.label}</span>
                    <b style={{ color: '#34C759' }}>{doc.status}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Users */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 16, padding: 15 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>Usuarios y permisos</div>
              <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.5 }}>
                64 usuarios · 8 perfiles. Todo cambio de permisos queda trazado en el audit log.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
