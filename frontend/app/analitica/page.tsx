// W10: Analítica · BI operativo
import AppLayout from '../components/AppLayout';

const bars = [
  { h: 62, day: 'L', dim: false },
  { h: 88, day: 'M', dim: false },
  { h: 74, day: 'X', dim: false },
  { h: 108, day: 'J', dim: false },
  { h: 80, day: 'V', dim: false },
  { h: 54, day: 'S', dim: true },
  { h: 48, day: 'D', dim: true },
];

export default function AnaliticaPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 15 }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
          }}>Analítica operativa</div>
          <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
            Visión en tiempo real · últimos 7 días
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 15 }}>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Incidencias semana</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5 }}>112</div>
            <div style={{ fontSize: 11, color: '#34C759' }}>+8% vs anterior</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>% por voz</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#0071E3' }}>71%</div>
            <div style={{ fontSize: 11, color: '#AEAEB2' }}>29% texto</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>Tiempo medio registro</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5 }}>12 s</div>
            <div style={{ fontSize: 11, color: '#34C759' }}>−97% vs papel</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#86868B' }}>% atendidas &lt;30min</div>
            <div style={{ fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif", fontWeight: 700, fontSize: 25, marginTop: 5, color: '#34C759' }}>86%</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          {/* Bar chart */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14 }}>Incidencias por día</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 11, height: 140 }}>
              {bars.map((bar, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: bar.h,
                    background: bar.dim
                      ? 'linear-gradient(180deg,#A9CEFF,#4C8FE0)'
                      : 'linear-gradient(180deg,#3D9BFF,#0071E3)',
                    borderRadius: '6px 6px 0 0',
                  }}></div>
                  <span style={{ fontSize: 11, color: '#AEAEB2' }}>{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By area */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14 }}>Por área</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { label: 'Enfermería', pct: 42, color: '#0071E3' },
                { label: 'Cocina / nutrición', pct: 24, color: '#0FB5A6' },
                { label: 'Psicología', pct: 18, color: '#AF52DE' },
                { label: 'Animación', pct: 16, color: '#FF9500' },
              ].map((area, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{area.label}</span>
                    <b>{area.pct}%</b>
                  </div>
                  <div style={{ height: 8, background: '#F0F0F3', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${area.pct}%`, height: '100%', background: area.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
