// W7: Ficha de residente
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';

export default function FichaResidentePage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
          <div style={{
            width: 62, height: 62, borderRadius: '50%',
            background: 'linear-gradient(150deg,#E7F0FE,#D8ECFF)',
            color: '#0071E3',
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>DG</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Dolores Gómez</div>
            <div style={{ fontSize: 13, color: '#86868B', marginTop: 2 }}>
              84 años · Habitación 12 · Ingreso: mar 2024 · Grado II
            </div>
          </div>
          <span style={{
            background: '#FDECEC', color: '#FF3B30',
            fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
          }}>Vigilancia activa</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid #E5E5EA', marginBottom: 15, fontSize: 13 }}>
          {['Resumen','Incidencias','PAI','Familia'].map((tab, i) => (
            <span key={tab} style={{
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? '#0071E3' : '#86868B',
              borderBottom: i === 0 ? '2px solid #0071E3' : '2px solid transparent',
              paddingBottom: 9, cursor: 'pointer',
            }}>{tab}</span>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 13 }}>
          {/* Datos clínicos */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 9 }}>
              Datos clínicos
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.7, color: '#48484A' }}>
              Movilidad: con andador<br/>
              Alergias: penicilina<br/>
              Dieta: triturada<br/>
              Médico: Dr. Ríos
            </div>
          </div>

          {/* Indicadores */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 9 }}>
              Indicadores
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#86868B' }}>Incidencias (30d)</span>
                <b>4</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#86868B' }}>Caídas (90d)</span>
                <b style={{ color: '#FF3B30' }}>1</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#86868B' }}>Ánimo medio</span>
                <b style={{ color: '#34C759' }}>Bueno</b>
              </div>
            </div>
          </div>

          {/* Últimas incidencias */}
          <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 9 }}>
              Últimas incidencias
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {[
                { desc: 'Caída sin lesión', fecha: 'hoy' },
                { desc: 'Buen ánimo, paseo', fecha: '2 jun' },
                { desc: 'Pérdida de apetito', fecha: '28 may' },
              ].map((inc, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{inc.desc}</span>
                  <span style={{ color: '#AEAEB2' }}>{inc.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Link href="/pai" style={{
            background: '#0071E3', color: '#fff',
            fontSize: 13, fontWeight: 700, padding: '10px 16px', borderRadius: 11,
          }}>Ver PAI</Link>
          <Link href="/expediente/dolores-gomez" style={{
            background: '#fff', border: '1px solid #E5E5EA',
            color: '#1D1D1F', fontSize: 13, fontWeight: 600, padding: '10px 16px', borderRadius: 11,
          }}>Ver expediente</Link>
        </div>
      </div>
    </AppLayout>
  );
}
