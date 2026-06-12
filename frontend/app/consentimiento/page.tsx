// W11: Consentimiento RGPD · alta del residente
import AppLayout from '../components/AppLayout';

export default function ConsentimientoPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, color: '#86868B' }}>Alta de residente</span>
          <span style={{ fontSize: 12.5, color: '#C7C7CC' }}>/</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Consentimiento informado</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.9fr', gap: 16, alignItems: 'start' }}>
          {/* Left: steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Step 1 */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: '#E8F7EF',
                  color: '#248A3D', fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>1</div>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>Capacidad legal</span>
                <span style={{ marginLeft: 'auto', background: '#E8F7EF', color: '#248A3D', fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>Verificado</span>
              </div>
              <div style={{ fontSize: 13, color: '#48484A', lineHeight: 1.5 }}>
                Residente <b>sin capacidad para consentir</b> (demencia documentada). Firma el <b>representante legal</b>.
              </div>
              <div style={{
                marginTop: 11, background: '#F5F5F7', borderRadius: 12, padding: '11px 13px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: '#fff', border: '1px solid #E5E5EA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 3h7l5 5v13H7z" stroke="#0071E3" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M14 3v5h5" stroke="#0071E3" strokeWidth="1.8"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Documento de tutela.pdf</div>
                  <div style={{ fontSize: 11, color: '#86868B' }}>verificado por ADMIN_CENTRO</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#34C759" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: '#E8F7EF',
                  color: '#248A3D', fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>2</div>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>Política de privacidad</span>
                <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#86868B' }}>v1.2.0 · 01 jun 2026</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#48484A', lineHeight: 1.6 }}>
                Tratamientos aceptados: expediente sociosanitario · gestión de incidencias · comunicaciones con familiares · procesamiento por Agentes IA (datos pseudonimizados).
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: '#E8F7EF',
                  color: '#248A3D', fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>3</div>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>Firma electrónica</span>
              </div>
              <div style={{
                border: '1.5px dashed #CFE0FB', borderRadius: 14,
                padding: 16, textAlign: 'center', background: '#FAFBFE',
              }}>
                <svg width="120" height="38" viewBox="0 0 120 38" fill="none" style={{ margin: '0 auto' }}>
                  <path d="M4 28c8-2 10-18 16-18s4 20 11 20 9-22 15-22 5 18 12 18 8-12 14-12 9 8 16 6 14-10 14-10" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div style={{ fontSize: 11.5, color: '#86868B', marginTop: 6 }}>
                  Firmado por <b>Carmen Gómez</b> (hija · representante legal)
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 11, color: '#6E6E73', background: '#F5F5F7', border: '1px solid #E5E5EA', padding: '4px 9px', borderRadius: 7 }}>Tablet en el centro</span>
                <span style={{ fontSize: 11, color: '#6E6E73', background: '#F5F5F7', border: '1px solid #E5E5EA', padding: '4px 9px', borderRadius: 7 }}>o enlace seguro · 48h</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {/* Result */}
            <div style={{
              background: 'linear-gradient(150deg,#102A45,#0071E3)',
              borderRadius: 18, padding: 17, color: '#fff',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resultado</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,.16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Consentimiento ACTIVO</div>
                  <div style={{ fontSize: 11.5, opacity: 0.85 }}>Acceso clínico habilitado</div>
                </div>
              </div>
              <div style={{
                marginTop: 13, background: 'rgba(255,255,255,.12)',
                borderRadius: 12, padding: '11px 13px', fontSize: 12, lineHeight: 1.6,
              }}>
                PDF/A generado<br/>
                Sello TSA + SHA-256<br/>
                Guardado como inmutable en el expediente
              </div>
            </div>

            {/* Warning */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FBE3C0', borderRadius: 14, padding: 13 }}>
              <div style={{ display: 'flex', gap: 9 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ fontSize: 12, color: '#7A5410', lineHeight: 1.5 }}>
                  <b>Regla:</b> sin consentimiento ACTIVO, los módulos clínicos quedan en <b>solo lectura</b> hasta su firma o renovación.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
