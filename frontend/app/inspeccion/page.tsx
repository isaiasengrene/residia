'use client';
// W12: Acceso de inspección · credencial temporal
import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { api } from '../../lib/api';

interface CredencialGenerada {
  id: string;
  codigo: string;
  validoHasta: string;
}

interface ResultadoValidacion {
  token: string;
  validoHasta: string;
  ambito: string;
}

type Vista = 'admin' | 'validar';

export default function InspeccionPage() {
  const [vista, setVista] = useState<Vista>('admin');

  // Estado admin
  const [horas, setHoras] = useState(24);
  const [ambito, setAmbito] = useState('completo');
  const [credencial, setCredencial] = useState<CredencialGenerada | null>(null);
  const [generando, setGenerando] = useState(false);
  const [errorAdmin, setErrorAdmin] = useState<string | null>(null);

  // Estado inspector
  const [codigoInput, setCodigoInput] = useState('');
  const [centroSlug, setCentroSlug] = useState('');
  const [resultadoValidacion, setResultadoValidacion] = useState<ResultadoValidacion | null>(null);
  const [validando, setValidando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Estado exportación
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [exportando, setExportando] = useState(false);

  const handleGenerarCredencial = async () => {
    setErrorAdmin(null);
    setGenerando(true);
    try {
      const res = await api.inspeccion.generarCredencial(horas, ambito) as CredencialGenerada;
      setCredencial(res);
    } catch (err) {
      setErrorAdmin(err instanceof Error ? err.message : 'Error al generar la credencial');
    } finally {
      setGenerando(false);
    }
  };

  const handleValidar = async () => {
    setErrorValidacion(null);
    setValidando(true);
    try {
      const res = await api.inspeccion.validar(codigoInput, centroSlug) as ResultadoValidacion;
      setResultadoValidacion(res);
      // Guardar token de inspector
      localStorage.setItem('inspector_token', res.token);
    } catch (err) {
      setErrorValidacion(err instanceof Error ? err.message : 'Código inválido o expirado');
    } finally {
      setValidando(false);
    }
  };

  const handleExportar = async () => {
    if (!desde || !hasta) return;
    setExportando(true);
    try {
      const datos = await api.inspeccion.exportar(desde, hasta);
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria-${desde.substring(0, 10)}-${hasta.substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silenciar
    } finally {
      setExportando(false);
    }
  };

  const minutosRestantes = (fecha: string) => {
    const diff = new Date(fecha).getTime() - Date.now();
    if (diff <= 0) return 'Expirada';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h} h ${m} min`;
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 15, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif",
              fontWeight: 700, fontSize: 21, letterSpacing: -0.3,
            }}>Acceso de inspección</div>
            <div style={{ fontSize: 13.5, color: '#86868B', marginTop: 3 }}>
              Credencial temporal de solo lectura para la Administración aragonesa
            </div>
          </div>

          {/* Pestañas */}
          <div style={{ display: 'flex', gap: 8, background: '#F2F2F7', borderRadius: 10, padding: 4 }}>
            {(['admin', 'validar'] as Vista[]).map((v) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: vista === v ? '#fff' : 'transparent',
                  color: vista === v ? '#1D1D1F' : '#86868B',
                  boxShadow: vista === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {v === 'admin' ? 'Administrador' : 'Inspector'}
              </button>
            ))}
          </div>
        </div>

        {vista === 'admin' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16, alignItems: 'start' }}>
            {/* Left: generar credencial */}
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
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
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Generar credencial</div>
                  <div style={{ fontSize: 12, color: '#86868B' }}>D.G. Atención a la Dependencia · Aragón</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 6 }}>
                    Validez (horas, máximo 72)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    value={horas}
                    onChange={(e) => setHoras(Math.min(72, Math.max(1, parseInt(e.target.value) || 1)))}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '9px 12px', border: '1.5px solid #D1D1D6', borderRadius: 10,
                      fontSize: 14, outline: 'none', color: '#1D1D1F',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 6 }}>
                    Ámbito de acceso
                  </label>
                  <select
                    value={ambito}
                    onChange={(e) => setAmbito(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '9px 12px', border: '1.5px solid #D1D1D6', borderRadius: 10,
                      fontSize: 14, outline: 'none', color: '#1D1D1F', background: '#fff',
                    }}
                  >
                    <option value="completo">Completo</option>
                    <option value="incidencias">Solo incidencias</option>
                    <option value="pai">Solo PAI</option>
                  </select>
                </div>
              </div>

              {errorAdmin && (
                <div style={{
                  background: '#FFF0F0', border: '1px solid #FFCDD2',
                  borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#C62828', marginBottom: 14,
                }}>
                  {errorAdmin}
                </div>
              )}

              {credencial && (
                <div style={{
                  background: '#F0F4FF', border: '1px solid #C7D9FF',
                  borderRadius: 14, padding: '14px 16px', marginBottom: 14,
                }}>
                  <div style={{ fontSize: 12, color: '#0071E3', fontWeight: 600, marginBottom: 8 }}>
                    Credencial generada
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 28, fontWeight: 700,
                    letterSpacing: 6, color: '#1D1D1F', textAlign: 'center',
                    padding: '12px 0',
                  }}>
                    {credencial.codigo}
                  </div>
                  <div style={{ fontSize: 12, color: '#86868B', textAlign: 'center' }}>
                    Caduca en {minutosRestantes(credencial.validoHasta)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 9 }}>
                <button
                  onClick={() => { void handleGenerarCredencial(); }}
                  disabled={generando}
                  style={{
                    flex: 1, background: generando ? '#86868B' : '#0071E3',
                    color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 12,
                    cursor: generando ? 'not-allowed' : 'pointer',
                  }}
                >
                  {generando ? 'Generando...' : 'Generar nueva credencial'}
                </button>
              </div>
            </div>

            {/* Right: paquete de auditoría */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 11 }}>Paquete de auditoría</div>
                <div style={{ fontSize: 12.5, color: '#48484A', lineHeight: 1.6, marginBottom: 14 }}>
                  Documentos firmados + audit log encadenado + certificado de integridad, en un ZIP firmado y verificable <b>sin depender de ResidIA</b>.
                </div>

                <div style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 4 }}>
                      Desde
                    </label>
                    <input
                      type="date"
                      value={desde}
                      onChange={(e) => setDesde(e.target.value)}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '8px 10px', border: '1.5px solid #D1D1D6', borderRadius: 9,
                        fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 4 }}>
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={hasta}
                      onChange={(e) => setHasta(e.target.value)}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '8px 10px', border: '1.5px solid #D1D1D6', borderRadius: 9,
                        fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => { void handleExportar(); }}
                  disabled={exportando || !desde || !hasta}
                  style={{
                    width: '100%', background: exportando || !desde || !hasta ? '#86868B' : '#1D1D1F',
                    color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: exportando || !desde || !hasta ? 'not-allowed' : 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {exportando ? 'Exportando...' : 'Exportar (PDF/A + XML)'}
                </button>
                <div style={{ fontSize: 11, color: '#AEAEB2', textAlign: 'center', marginTop: 8 }}>
                  Disponible en ≤ 5 minutos
                </div>
              </div>

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
        ) : (
          /* Vista Inspector: validar código */
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <div style={{ background: '#fff', border: '1px solid #ECECF0', borderRadius: 18, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Acceso de inspector</div>
              <div style={{ fontSize: 13, color: '#86868B', marginBottom: 20 }}>
                Introduce el código de 8 caracteres proporcionado por el administrador del centro.
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 6 }}>
                  Código de acceso
                </label>
                <input
                  type="text"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value.toUpperCase().substring(0, 8))}
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 13px', border: '1.5px solid #D1D1D6', borderRadius: 10,
                    fontSize: 20, fontFamily: 'monospace', letterSpacing: 5,
                    outline: 'none', color: '#1D1D1F', textAlign: 'center',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#48484A', display: 'block', marginBottom: 6 }}>
                  Identificador del centro
                </label>
                <input
                  type="text"
                  value={centroSlug}
                  onChange={(e) => setCentroSlug(e.target.value)}
                  placeholder="nombre-residencia"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 13px', border: '1.5px solid #D1D1D6', borderRadius: 10,
                    fontSize: 14, outline: 'none', color: '#1D1D1F',
                  }}
                />
              </div>

              {errorValidacion && (
                <div style={{
                  background: '#FFF0F0', border: '1px solid #FFCDD2',
                  borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#C62828', marginBottom: 14,
                }}>
                  {errorValidacion}
                </div>
              )}

              {resultadoValidacion && (
                <div style={{
                  background: '#F0FFF4', border: '1px solid #A7F3D0',
                  borderRadius: 12, padding: '14px 16px', marginBottom: 16,
                }}>
                  <div style={{ fontWeight: 700, color: '#065F46', fontSize: 13.5, marginBottom: 6 }}>
                    Acceso concedido
                  </div>
                  <div style={{ fontSize: 12.5, color: '#047857' }}>
                    Ámbito: <b>{resultadoValidacion.ambito}</b>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#047857', marginTop: 3 }}>
                    Válido hasta: {new Date(resultadoValidacion.validoHasta).toLocaleString('es-ES')}
                  </div>
                </div>
              )}

              <button
                onClick={() => { void handleValidar(); }}
                disabled={validando || codigoInput.length !== 8 || !centroSlug}
                style={{
                  width: '100%',
                  background: validando || codigoInput.length !== 8 || !centroSlug ? '#86868B' : '#0071E3',
                  color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: 14, padding: 13, borderRadius: 12,
                  cursor: validando || codigoInput.length !== 8 || !centroSlug ? 'not-allowed' : 'pointer',
                }}
              >
                {validando ? 'Validando...' : 'Validar código'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
