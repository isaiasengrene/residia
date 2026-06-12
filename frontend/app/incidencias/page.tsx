// W3: Libro de Incidencias Digital
import AppLayout from '../components/AppLayout';
import Link from 'next/link';

const incidencias = [
  { hora: '10:41', residente: 'Dolores Gómez', tipo: 'Caída sin lesión', area: 'Enfermería', prioridad: 'Alta', informa: 'Marta R.', origen: '🎙 Voz', priColor: '#FF3B30', priBg: '#FDECEC', highlight: true, id: 'INC-2026-0412' },
  { hora: '10:12', residente: 'Antonio Ferrer', tipo: 'Rechazo medicación', area: 'Enfermería', prioridad: 'Media', informa: 'Carmen L.', origen: 'Texto', priColor: '#FF9500', priBg: '#FBF0DC', highlight: false, id: 'INC-2026-0411' },
  { hora: '09:48', residente: 'Pilar Navarro', tipo: 'No ha desayunado', area: 'Cocina', prioridad: 'Media', informa: 'Marta R.', origen: '🎙 Voz', priColor: '#FF9500', priBg: '#FBF0DC', highlight: false, id: 'INC-2026-0410' },
  { hora: '08:30', residente: 'Manuel Ortega', tipo: 'Desorientación nocturna', area: 'Psicología', prioridad: 'Alta', informa: 'José M.', origen: '🎙 Voz', priColor: '#FF3B30', priBg: '#FDECEC', highlight: false, id: 'INC-2026-0409' },
  { hora: '07:55', residente: 'Rosa Iglesias', tipo: 'Buen ánimo, paseo', area: 'Animación', prioridad: 'Baja', informa: 'Carmen L.', origen: 'Texto', priColor: '#34C759', priBg: '#E8F2EC', highlight: false, id: 'INC-2026-0408' },
];

export default function IncidenciasPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Libro de Incidencias Digital</div>
            <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
              Registro único, trazable y en tiempo real · 12 jun 2026
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#fff', border: '1px solid #E5E5EA', borderRadius: 9,
            padding: '7px 12px', color: '#AEAEB2', fontSize: 12.5,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#AEAEB2" strokeWidth="2"/>
              <path d="M20 20l-3.5-3.5" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Buscar residente…
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 13 }}>
          {['Todas','Alta prioridad','Pendientes','Por área'].map((f, i) => (
            <span key={f} style={{
              background: i === 0 ? '#1D1D1F' : '#fff',
              color: i === 0 ? '#fff' : '#6E6E73',
              border: i === 0 ? 'none' : '1px solid #E5E5EA',
              fontSize: 12, fontWeight: i === 0 ? 600 : 400,
              padding: '6px 13px', borderRadius: 999,
              cursor: 'pointer',
            }}>{f}</span>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1.5fr 1.7fr 1fr 0.9fr 1fr 0.8fr',
            gap: 10, padding: '11px 16px',
            background: '#F5F5F7',
            fontSize: 10.5, fontWeight: 700, color: '#AEAEB2',
            textTransform: 'uppercase', letterSpacing: 0.3,
          }}>
            <span>Hora</span><span>Residente</span><span>Tipo</span>
            <span>Área</span><span>Prioridad</span><span>Informa</span><span>Origen</span>
          </div>

          {incidencias.map((inc, i) => (
            <Link key={inc.id} href={`/incidencias/${inc.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1.5fr 1.7fr 1fr 0.9fr 1fr 0.8fr',
                gap: 10, padding: '12px 16px', alignItems: 'center',
                borderBottom: i < incidencias.length - 1 ? '1px solid #F2F2F7' : 'none',
                background: inc.highlight ? '#F5F5F7' : '#fff',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{inc.hora}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{inc.residente}</span>
                <span style={{ fontSize: 12.5, color: '#48484A' }}>{inc.tipo}</span>
                <span style={{ fontSize: 12.5, color: '#48484A' }}>{inc.area}</span>
                <span>
                  <span style={{
                    background: inc.priBg, color: inc.priColor,
                    fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                  }}>{inc.prioridad}</span>
                </span>
                <span style={{ fontSize: 12.5, color: '#48484A' }}>{inc.informa}</span>
                <span style={{
                  fontSize: 11,
                  color: inc.origen.includes('Voz') ? '#0071E3' : '#86868B',
                  fontWeight: 600,
                }}>{inc.origen}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
