// W4: Detalle de incidencia · trazabilidad
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';

export default function IncidenciaDetallePage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <svg width="9" height="15" viewBox="0 0 12 20" fill="none">
            <path d="M10 2L2 10l8 8" stroke="#0071E3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Link href="/incidencias" style={{ fontSize: 12.5, color: '#86868B' }}>Libro de Incidencias</Link>
          <span style={{ fontSize: 12.5, color: '#C7C7CC' }}>/</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>INC-2026-0412</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16 }}>
          {/* Left: detail */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 17 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
              <div style={{
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
                fontWeight: 700, fontSize: 18,
              }}>Dolores Gómez</div>
              <span style={{
                background: '#FDECEC', color: '#FF3B30',
                fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 999,
              }}>PRIORIDAD ALTA</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                { label: 'Residente', value: 'Dolores Gómez · Hab. 12' },
                { label: 'Tipo', value: 'Caída sin lesión aparente' },
                { label: 'Área', value: 'Enfermería' },
                { label: 'Informa', value: 'Marta R. (auxiliar)' },
                { label: 'Acción', value: 'Avisar a enfermera de turno', blue: true },
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{
                      width: 96, flexShrink: 0, fontSize: 11, fontWeight: 700,
                      color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.3,
                      paddingTop: 1,
                    }}>{row.label}</span>
                    <span style={{
                      fontSize: 13.5, fontWeight: 600,
                      color: (row as any).blue ? '#0071E3' : '#1D1D1F',
                    }}>{row.value}</span>
                  </div>
                  {i < 4 && <div style={{ height: 1, background: '#F2F2F7', marginTop: 9 }}/>}
                </div>
              ))}
            </div>

            {/* Voice quote */}
            <div style={{
              marginTop: 13, background: '#F5F5F7',
              borderLeft: '3px solid #0FB5A6', borderRadius: 8,
              padding: '10px 12px', fontSize: 12.5, color: '#6E6E73', fontStyle: 'italic',
            }}>
              "Dolores, la de la 12, se ha resbalado al ir al baño. Está bien, no se ha hecho nada, pero la he sentado."
            </div>

            {/* Audio player */}
            <div style={{
              marginTop: 11, background: '#EFF4FA', borderRadius: 10,
              padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: '#0071E3',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="12" height="14" viewBox="0 0 13 15" fill="#fff">
                  <path d="M1 1.5v12l11-6z"/>
                </svg>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', height: 20 }}>
                {[7,14,10,18,8,13,16].map((h, i) => (
                  <span key={i} style={{ width: 3, height: h, background: '#A9CEFF', borderRadius: 3 }}></span>
                ))}
              </div>
              <span style={{ fontSize: 11.5, color: '#86868B' }}>0:08</span>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Trazabilidad */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12 }}>
                Trazabilidad
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { color: '#0071E3', title: 'Registrada por voz', sub: 'Marta R. · 12 jun 10:41:03' },
                  { color: '#0FB5A6', title: 'Transcrita y clasificada por la IA', sub: 'Automático · 10:41:09' },
                  { color: '#FF9500', title: 'Alerta a enfermera de turno', sub: 'Lucía G. (DUE) · 10:42' },
                  { color: '#34C759', title: 'Atendida y cerrada', sub: 'Lucía G. · 10:55', last: true },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', background: step.color }}></div>
                      {!(step as any).last && <div style={{ width: 2, flex: 1, background: '#E5E5EA' }}></div>}
                    </div>
                    <div style={{ paddingBottom: (step as any).last ? 0 : 13 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{step.title}</div>
                      <div style={{ fontSize: 11.5, color: '#AEAEB2' }}>{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 9 }}>
              <div style={{
                flex: 1, background: '#0071E3', color: '#fff', textAlign: 'center',
                fontWeight: 700, fontSize: 13, padding: 11, borderRadius: 11, cursor: 'pointer',
              }}>Marcar como atendida</div>
              <div style={{
                border: '1.5px solid #E0E6EC', color: '#6E6E73', fontWeight: 600,
                fontSize: 13, padding: '11px 16px', borderRadius: 11, cursor: 'pointer',
              }}>Reasignar</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
