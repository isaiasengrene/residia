// W15: Audit Log · cadena de integridad
import AppLayout from '../components/AppLayout';

const logs = [
  { hora: '10:55:12', usuario: 'Lucía G. · sanitario', accion: 'UPDATE · cierre incidencia', recurso: 'INC-0412', hash: 'a3f9…b1' },
  { hora: '10:42:03', usuario: 'Sistema · IA', accion: 'AI_DRAFT_CONFIRMED', recurso: 'INC-0412', hash: '7c20…e4' },
  { hora: '10:41:09', usuario: 'Marta R. · auxiliar', accion: 'CREATE · incidencia (voz)', recurso: 'INC-0412', hash: 'f180…9a' },
  { hora: '09:30:44', usuario: 'Nuria T. · trab. social', accion: 'CONSENT_GIVEN', recurso: 'RES-0188', hash: '2b55…c7' },
  { hora: '08:00:01', usuario: 'Inspector · INSP-038', accion: 'EXPORT · paquete auditoría', recurso: 'rango 01–12 jun', hash: 'd9e1…02' },
];

export default function AuditLogPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Registro de auditoría</div>
            <div style={{ fontSize: 13.5, color: '#86868B', marginTop: 3 }}>
              Append-only · hash encadenado · sello TSA por registro
            </div>
          </div>
          <span style={{
            fontSize: 12, color: '#34C759', background: '#E8F7EF',
            padding: '7px 13px', borderRadius: 999, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#34C759" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cadena íntegra · verificado hoy
          </span>
        </div>

        {/* Log table */}
        <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '78px 1fr 1.3fr 1.1fr 0.9fr',
            gap: 10, padding: '11px 16px',
            background: '#F5F5F7',
            fontSize: 10.5, fontWeight: 700, color: '#AEAEB2',
            textTransform: 'uppercase', letterSpacing: 0.3,
          }}>
            <span>Hora</span><span>Usuario · perfil</span><span>Acción</span><span>Recurso</span><span>Hash</span>
          </div>

          {logs.map((log, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '78px 1fr 1.3fr 1.1fr 0.9fr',
              gap: 10, padding: '11px 16px', alignItems: 'center',
              borderBottom: i < logs.length - 1 ? '1px solid #F2F2F7' : 'none',
              fontSize: 12.5,
            }}>
              <span style={{ fontWeight: 600 }}>{log.hora}</span>
              <span>{log.usuario}</span>
              <span style={{ color: '#48484A' }}>{log.accion}</span>
              <span style={{ color: '#48484A' }}>{log.recurso}</span>
              <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10.5, color: '#0071E3' }}>{log.hash}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 12, display: 'flex', gap: 11 }}>
          <div style={{
            flex: 1, background: '#fff', border: '1px solid #ECECF0',
            borderRadius: 14, padding: 13, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 7V5a4 4 0 0 1 8 0v2M5 7h14l-1 14H6L5 7Z" stroke="#86868B" strokeWidth="1.7" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.5 }}>
              Tabla <b>append-only</b>: ningún rol puede modificar ni borrar. Cada registro encadena el hash del anterior.
            </div>
          </div>
          <div style={{
            background: '#1D1D1F', color: '#fff', fontWeight: 700, fontSize: 13,
            padding: '0 18px', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            CSV firmado
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
