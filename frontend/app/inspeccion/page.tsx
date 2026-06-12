// W12: Acceso de inspección · credencial temporal
import AppLayout from '../components/AppLayout';

export default function InspeccionPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 15 }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
          }}>Acceso de inspección</div>
          <div style={{ fontSize: 13.5, color: '#86868B', marginTop: 3 }}>
            Credencial temporal de solo lectura para la Administración aragonesa
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16, alignItems: 'start' }}>
          {/* Left: credential */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 15 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', background: '#EEF4FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" stroke="#0071E3" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#0071E3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Credencial activa</div>
                <div style={{ fontSize: 12, color: '#86868B' }}>D.G. Atención a la Dependencia · Aragón</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Inspector', value: 'Ref. INSP-AR-2026-038' },
                { label: 'Permisos', value: 'Solo lectura + exportación' },
                { label: 'Alcance', value: 'Incidencias · 01–12 jun 2026' },
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#86868B' }}>{row.label}</span>
                    <b>{row.value}</b>
                  </div>
                  <div style={{ height: 1, background: '#F2F2F7', marginTop: 10 }}/>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: '#86868B' }}>Caduca en</span>
                <span style={{
                  background: '#FFF7ED', color: '#B26A00',
                  fontWeight: 700, padding: '4px 10px', borderRadius: 999, fontSize: 12,
                }}>23 h 41 min</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 9, marginTop: 15 }}>
              <div style={{
                flex: 1, background: '#0071E3', color: '#fff', textAlign: 'center',
                fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 12, cursor: 'pointer',
              }}>Generar nueva credencial</div>
              <div style={{
                border: '1.5px solid #FBD2D0', color: '#FF3B30',
                fontWeight: 600, fontSize: 13.5, padding: '11px 16px', borderRadius: 12, cursor: 'pointer',
              }}>Revocar</div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {/* Audit package */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 11 }}>Paquete de auditoría</div>
              <div style={{ fontSize: 12.5, color: '#48484A', lineHeight: 1.6 }}>
                Documentos firmados + audit log encadenado + certificado de integridad, en un ZIP firmado y verificable <b>sin depender de ResidIA</b>.
              </div>
              <div style={{
                marginTop: 12, background: '#1D1D1F', color: '#fff', textAlign: 'center',
                fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: 'pointer',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Exportar (PDF/A + XML)
              </div>
              <div style={{ fontSize: 11, color: '#AEAEB2', textAlign: 'center', marginTop: 8 }}>
                Disponible en ≤ 5 minutos
              </div>
            </div>

            {/* Note */}
            <div style={{ background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 14, padding: 13, display: 'flex', gap: 9 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" stroke="#86868B" strokeWidth="1.8"/>
                <path d="M12 8v5l3 2" stroke="#86868B" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.5 }}>
                Cada acceso y exportación del inspector queda registrado en el <b>audit log inmutable</b> con trazabilidad reforzada.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
