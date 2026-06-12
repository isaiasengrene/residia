// W14: Expediente del residente · por secciones
import AppLayout from '../../components/AppLayout';

export default function ExpedientePage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: 'linear-gradient(150deg,#E7F0FE,#D8ECFF)',
            color: '#0071E3',
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>DG</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 20, letterSpacing: -0.3,
            }}>Expediente · Dolores Gómez</div>
            <div style={{ fontSize: 12.5, color: '#86868B', marginTop: 2 }}>
              Hab. 12 · Exp. EXP-2024-031 · documentos firmados e inmutables
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          {[
            { label: 'Identificación', active: true },
            { label: 'Social', active: false },
            { label: 'Clínico', active: false, bold: true },
            { label: 'PAI', active: false, bold: true },
            { label: 'Medicación', active: false, bold: true },
            { label: 'Legal', active: false, locked: true },
            { label: 'Incidencias', active: false },
          ].map((tab, i) => (
            <span key={i} style={{
              background: tab.active ? '#1D1D1F' : '#fff',
              color: tab.active ? '#fff' : tab.locked ? '#C7C7CC' : tab.bold ? '#1D1D1F' : '#6E6E73',
              border: tab.active ? 'none' : '1px solid #E5E5EA',
              fontSize: 12, fontWeight: tab.active || tab.bold ? 600 : 400,
              padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {tab.locked && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="#C7C7CC" strokeWidth="2"/>
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#C7C7CC" strokeWidth="2"/>
                </svg>
              )}
              {tab.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          {/* Clinical section */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14.5 }}>Sección clínica</span>
              <span style={{ fontSize: 11, color: '#0071E3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="#0071E3" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="2.5" stroke="#0071E3" strokeWidth="1.8"/>
                </svg>
                Acceso registrado
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13 }}>
              {[
                { label: 'Diagnósticos', value: 'Alzheimer moderado · HTA' },
                { label: 'Movilidad', value: 'Con andador · riesgo de caída' },
                { label: 'Alergias', value: 'Penicilina' },
                { label: 'Última nota', value: 'Estable · 12 jun, Dr. Ríos' },
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ width: 108, flexShrink: 0, color: '#86868B' }}>{row.label}</span>
                    <b>{row.value}</b>
                  </div>
                  {i < 3 && <div style={{ height: 1, background: '#F2F2F7', marginTop: 9 }}/>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 13, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {[
                { label: 'Firmado · inmutable', color: '#248A3D', bg: '#E8F7EF', border: '#BFE8D2' },
                { label: 'SHA-256 ✓', color: '#248A3D', bg: '#E8F7EF', border: '#BFE8D2' },
                { label: 'AES-256 cifrado', color: '#6E6E73', bg: '#F2F2F7', border: '#E5E5EA' },
              ].map((badge, i) => (
                <span key={i} style={{
                  fontSize: 9.5, fontWeight: 700, color: badge.color,
                  background: badge.bg, border: `1px solid ${badge.border}`,
                  padding: '3px 8px', borderRadius: 6,
                }}>{badge.label}</span>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {/* Audit note */}
            <div style={{ background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 14, padding: 13, display: 'flex', gap: 9 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="#86868B" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="2.5" stroke="#86868B" strokeWidth="1.8"/>
              </svg>
              <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.5 }}>
                Toda lectura del expediente —incluida esta— queda en el <b>audit log</b> con la sección consultada (Ley 41/2002).
              </div>
            </div>

            {/* Access by profile */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 14, padding: 13 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 9 }}>Acceso por perfil</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12 }}>
                {[
                  { perfil: 'Enfermera (tú)', acceso: 'Lectura / escritura', color: '#34C759' },
                  { perfil: 'Auxiliar', acceso: 'Sin acceso clínico', color: '#86868B' },
                  { perfil: 'Familiar', acceso: 'Solo bienestar', color: '#86868B' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6E6E73' }}>{row.perfil}</span>
                    <b style={{ color: row.color }}>{row.acceso}</b>
                  </div>
                ))}
              </div>
            </div>

            {/* Export button */}
            <div style={{
              background: '#1D1D1F', color: '#fff', textAlign: 'center',
              fontWeight: 700, fontSize: 13, padding: 11, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Exportar copia (PDF/A firmado)
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
