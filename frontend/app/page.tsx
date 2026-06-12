// W1: Login page
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg,#1D1D1F 0%,#1c2230 45%,#243246 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
        {/* Left: branding */}
        <div style={{ color: '#fff', maxWidth: 300 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 15,
            background: 'rgba(255,255,255,.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 6a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.1A.5.5 0 0 1 5.2 18.2V15.5A2.5 2.5 0 0 1 4 13.4Z" fill="#fff"/>
            </svg>
          </div>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 30, letterSpacing: -0.5,
          }}>
            ResidIA<span style={{ color: '#3D9BFF' }}>.</span>
          </div>
          <div style={{ fontSize: 15, color: '#B9CBDD', lineHeight: 1.55, marginTop: 12 }}>
            El Libro de Incidencias Digital de tu residencia. Registro único, trazable y en tiempo real.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 18, fontSize: 12, color: '#8FA8C0' }}>
            <span>eIDAS</span>·<span>RGPD</span>·<span>Trazabilidad ante inspección</span>
          </div>
        </div>

        {/* Right: login card */}
        <div style={{
          background: '#fff',
          borderRadius: 18,
          padding: 28,
          width: 320,
          boxShadow: '0 24px 50px rgba(0,0,0,.3)',
        }}>
          <div style={{
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
            fontWeight: 700, fontSize: 19, marginBottom: 4,
          }}>Iniciar sesión</div>
          <div style={{ fontSize: 13, color: '#86868B', marginBottom: 18 }}>
            Acceso del equipo de coordinación
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>
            Usuario
          </div>
          <div style={{
            background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 10,
            padding: '11px 13px', fontSize: 13.5, color: '#424245', marginBottom: 13,
          }}>
            Laura Beltrán · Coordinación
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>
            Contraseña
          </div>
          <div style={{
            background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 10,
            padding: '11px 13px', fontSize: 13.5, color: '#424245', marginBottom: 16,
          }}>
            ••••••••••
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4 }}>Código 2FA</span>
            <span style={{ fontSize: 11, color: '#0071E3', fontWeight: 600 }}>Reenviar</span>
          </div>
          <div style={{ display: 'flex', gap: 7, marginBottom: 18 }}>
            {['4','8','1'].map((d, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                background: '#fff', border: '1.5px solid #0071E3',
                borderRadius: 9, padding: '10px 0',
                fontSize: 18, fontWeight: 700, color: '#1D1D1F',
              }}>{d}</div>
            ))}
            {['·','·','·'].map((d, i) => (
              <div key={i+3} style={{
                flex: 1, textAlign: 'center',
                background: '#F5F5F7', border: '1.5px solid #E5E5EA',
                borderRadius: 9, padding: '10px 0',
                fontSize: 18, fontWeight: 700, color: '#C7C7CC',
              }}>{d}</div>
            ))}
          </div>

          <Link href="/dashboard">
            <div style={{
              background: '#0071E3', color: '#fff', textAlign: 'center',
              fontWeight: 700, fontSize: 14, padding: 12, borderRadius: 11,
              cursor: 'pointer',
            }}>
              Verificar y entrar
            </div>
          </Link>
          <div style={{ textAlign: 'center', fontSize: 11.5, color: '#AEAEB2', marginTop: 13, lineHeight: 1.4 }}>
            Doble factor obligatorio para perfiles clínicos<br/>
            ENS categoría MEDIA · RGPD
          </div>
        </div>
      </div>
    </div>
  );
}
