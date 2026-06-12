'use client';

// W1: Login page
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { iniciarSesion } from '../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo2fa, setCodigo2fa] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await iniciarSesion(email, password, codigo2fa);
      router.push('/dashboard');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }

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
        <form onSubmit={handleSubmit} style={{
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
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@residencia.es"
            required
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 10,
              padding: '11px 13px', fontSize: 13.5, color: '#424245', marginBottom: 13,
              outline: 'none',
            }}
          />

          <div style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 }}>
            Contraseña
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••"
            required
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#F5F5F7', border: '1px solid #E5E5EA', borderRadius: 10,
              padding: '11px 13px', fontSize: 13.5, color: '#424245', marginBottom: 16,
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: 0.4 }}>Código 2FA</span>
          </div>
          <input
            type="text"
            value={codigo2fa}
            onChange={e => setCodigo2fa(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#F5F5F7', border: '1.5px solid #E5E5EA', borderRadius: 9,
              padding: '10px 13px', fontSize: 18, fontWeight: 700,
              color: '#1D1D1F', marginBottom: 18, textAlign: 'center',
              letterSpacing: 6, outline: 'none',
            }}
          />

          {error && (
            <div style={{
              background: '#FFF0F0', border: '1px solid #FFCCCC',
              borderRadius: 9, padding: '10px 13px',
              fontSize: 13, color: '#CC0000', marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              background: cargando ? '#86868B' : '#0071E3',
              color: '#fff', textAlign: 'center',
              fontWeight: 700, fontSize: 14, padding: 12, borderRadius: 11,
              cursor: cargando ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {cargando ? 'Verificando…' : 'Verificar y entrar'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 11.5, color: '#AEAEB2', marginTop: 13, lineHeight: 1.4 }}>
            Doble factor obligatorio para perfiles clínicos<br/>
            ENS categoría MEDIA · RGPD
          </div>
        </form>
      </div>
    </div>
  );
}
