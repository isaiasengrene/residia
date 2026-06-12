'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { api } from '../../../lib/api';

// ----------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------

interface ModeloIa {
  id: string;
  proveedor: string;
  modelo: string;
  alias: string | null;
  agente: string;
  activo: boolean;
  latencia_ms_promedio: number | null;
  llamadas_totales: number;
  errores_totales: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  proveedor: string;
  modelo: string;
  alias: string;
  agente: string;
  apiKey: string;
  activo: boolean;
}

const FORM_INICIAL: FormData = {
  proveedor: 'anthropic',
  modelo: '',
  alias: '',
  agente: 'registro',
  apiKey: '',
  activo: false,
};

const PROVEEDORES = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai',    label: 'OpenAI (GPT)' },
  { value: 'google',    label: 'Google (Gemini)' },
];

const AGENTES = [
  { value: 'registro',      label: 'Registro' },
  { value: 'comunicacion',  label: 'Comunicación' },
  { value: 'seguimiento',   label: 'Seguimiento' },
  { value: 'pai',           label: 'PAI' },
  { value: 'todos',         label: 'Todos' },
];

const LABEL_PROVEEDOR: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openai:    'OpenAI (GPT)',
  google:    'Google (Gemini)',
};

const LABEL_AGENTE: Record<string, string> = {
  registro:     'Registro',
  comunicacion: 'Comunicación',
  seguimiento:  'Seguimiento',
  pai:          'PAI',
  todos:        'Todos',
};

// ----------------------------------------------------------------
// Estilos reutilizables
// ----------------------------------------------------------------

const sf = "-apple-system,'SF Pro Display','SF Pro Text',system-ui,sans-serif";

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #ECECF0',
  borderRadius: 14,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#6E6E73',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #D1D1D6',
  borderRadius: 9,
  fontSize: 13.5,
  fontFamily: sf,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23AEAEB2' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 30,
};

const btnPrimary: React.CSSProperties = {
  background: '#0071E3',
  color: '#fff',
  border: 'none',
  borderRadius: 9,
  padding: '9px 18px',
  fontSize: 13.5,
  fontWeight: 600,
  fontFamily: sf,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  background: 'transparent',
  color: '#6E6E73',
  border: '1px solid #D1D1D6',
  borderRadius: 9,
  padding: '9px 16px',
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: sf,
  cursor: 'pointer',
};

const btnSmall: React.CSSProperties = {
  border: 'none',
  borderRadius: 7,
  padding: '5px 11px',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: sf,
  cursor: 'pointer',
};

// ----------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------

export default function ModelosIaPage() {
  const [modelos, setModelos] = useState<ModeloIa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // ----------------------------------------------------------------
  // Cargar modelos
  // ----------------------------------------------------------------

  const cargarModelos = async () => {
    try {
      setCargando(true);
      setError(null);
      const resp = await api.modelosIa.listar();
      setModelos((resp as ModeloIa[]) ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cargar los modelos';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarModelos();
  }, []);

  // ----------------------------------------------------------------
  // Acciones
  // ----------------------------------------------------------------

  const handleGuardar = async () => {
    if (!form.modelo.trim()) {
      setErrorForm('El campo Modelo es obligatorio.');
      return;
    }
    if (!form.apiKey.trim()) {
      setErrorForm('La API key es obligatoria.');
      return;
    }
    setGuardando(true);
    setErrorForm(null);
    try {
      await api.modelosIa.crear({
        proveedor: form.proveedor,
        modelo: form.modelo.trim(),
        alias: form.alias.trim() || undefined,
        agente: form.agente,
        apiKey: form.apiKey,
        activo: form.activo,
      });
      setForm(FORM_INICIAL);
      setMostrarFormulario(false);
      await cargarModelos();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al guardar el modelo';
      setErrorForm(msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleActivar = async (id: string) => {
    try {
      await api.modelosIa.activar(id);
      await cargarModelos();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al activar el modelo';
      alert(msg);
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await api.modelosIa.desactivar(id);
      await cargarModelos();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al desactivar el modelo';
      alert(msg);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este modelo? Esta acción no se puede deshacer.')) return;
    try {
      await api.modelosIa.eliminar(id);
      await cargarModelos();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al eliminar el modelo';
      alert(msg);
    }
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: sf, fontWeight: 700, fontSize: 21, letterSpacing: -0.3 }}>
              Modelos IA
            </div>
            <div style={{ fontSize: 13, color: '#86868B', marginTop: 3 }}>
              Configura los proveedores de IA y mide su asertividad en la extracción de registros
            </div>
          </div>
          {!mostrarFormulario && (
            <button
              style={btnPrimary}
              onClick={() => { setMostrarFormulario(true); setErrorForm(null); }}
            >
              + Añadir modelo
            </button>
          )}
        </div>

        {/* Formulario */}
        {mostrarFormulario && (
          <div style={{ ...cardStyle, padding: 20, marginBottom: 20 }}>
            <div style={{ fontFamily: sf, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              Nuevo modelo IA
            </div>

            {/* Fila 1: Proveedor + Modelo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Proveedor</label>
                <select
                  style={selectStyle}
                  value={form.proveedor}
                  onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))}
                >
                  {PROVEEDORES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Modelo</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="claude-opus-4-8 · gpt-4o-mini"
                  value={form.modelo}
                  onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                />
              </div>
            </div>

            {/* Fila 2: Alias + Agente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Alias <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#AEAEB2' }}>(opcional)</span></label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="OCR rápido · Registro económico"
                  value={form.alias}
                  onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
                />
              </div>
              <div>
                <label style={labelStyle}>Agente</label>
                <select
                  style={selectStyle}
                  value={form.agente}
                  onChange={e => setForm(f => ({ ...f, agente: e.target.value }))}
                >
                  {AGENTES.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* API Key */}
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>API Key</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="sk-..."
                value={form.apiKey}
                onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                autoComplete="new-password"
              />
              <div style={{ fontSize: 11.5, color: '#AEAEB2', marginTop: 5 }}>
                🔒 Se cifra en la BD; nunca se guarda en claro.
              </div>
            </div>

            {/* Checkbox activo */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  style={{ width: 15, height: 15, accentColor: '#0071E3' }}
                />
                Usar como modelo activo para este agente
              </label>
            </div>

            {/* Error formulario */}
            {errorForm && (
              <div style={{
                background: '#FFF6F5', border: '1px solid #FBD2D0', borderRadius: 8,
                padding: '9px 13px', fontSize: 13, color: '#FF3B30', marginBottom: 14,
              }}>
                {errorForm}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                style={btnGhost}
                onClick={() => { setMostrarFormulario(false); setForm(FORM_INICIAL); setErrorForm(null); }}
                disabled={guardando}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Error general */}
        {error && (
          <div style={{
            background: '#FFF6F5', border: '1px solid #FBD2D0', borderRadius: 10,
            padding: '12px 16px', fontSize: 13.5, color: '#FF3B30', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Tabla */}
        <div style={cardStyle}>
          {/* Tabla header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.1fr 1.2fr 0.9fr 1.4fr',
            padding: '10px 18px',
            borderBottom: '1px solid #F2F2F7',
            fontSize: 11,
            fontWeight: 700,
            color: '#AEAEB2',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            <span>Proveedor · Modelo</span>
            <span>Agente</span>
            <span>Alias</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {/* Filas */}
          {cargando ? (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 13.5, color: '#AEAEB2' }}>
              Cargando modelos...
            </div>
          ) : modelos.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 13.5, color: '#AEAEB2', marginBottom: 10 }}>
                No hay modelos configurados todavía.
              </div>
              {!mostrarFormulario && (
                <button style={btnPrimary} onClick={() => setMostrarFormulario(true)}>
                  + Añadir el primer modelo
                </button>
              )}
            </div>
          ) : (
            modelos.map((m, i) => (
              <div
                key={m.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.1fr 1.2fr 0.9fr 1.4fr',
                  padding: '13px 18px',
                  borderBottom: i < modelos.length - 1 ? '1px solid #F2F2F7' : 'none',
                  alignItems: 'center',
                }}
              >
                {/* Proveedor · Modelo */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.modelo}</div>
                  <div style={{ fontSize: 11.5, color: '#86868B', marginTop: 2 }}>
                    {LABEL_PROVEEDOR[m.proveedor] ?? m.proveedor}
                  </div>
                </div>

                {/* Agente */}
                <div style={{ fontSize: 13, color: '#1D1D1F' }}>
                  {LABEL_AGENTE[m.agente] ?? m.agente}
                </div>

                {/* Alias */}
                <div style={{ fontSize: 13, color: m.alias ? '#1D1D1F' : '#AEAEB2' }}>
                  {m.alias ?? '—'}
                </div>

                {/* Estado */}
                <div>
                  <span style={{
                    background: m.activo ? '#34C759' : '#AEAEB2',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '3px 9px',
                    fontSize: 11.5,
                    fontWeight: 600,
                  }}>
                    {m.activo ? 'activo' : 'inactivo'}
                  </span>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {!m.activo && (
                    <button
                      style={{ ...btnSmall, background: '#F0F7FF', color: '#0071E3' }}
                      onClick={() => handleActivar(m.id)}
                    >
                      Activar
                    </button>
                  )}
                  {m.activo && (
                    <button
                      style={{ ...btnSmall, background: '#F2F2F7', color: '#6E6E73' }}
                      onClick={() => handleDesactivar(m.id)}
                    >
                      Desactivar
                    </button>
                  )}
                  {!m.activo && (
                    <button
                      style={{ ...btnSmall, background: '#FFF6F5', color: '#FF3B30' }}
                      onClick={() => handleEliminar(m.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Métricas pie de página */}
        {modelos.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: '#AEAEB2', textAlign: 'right' }}>
            {modelos.filter(m => m.activo).length} activo(s) · {modelos.length} modelo(s) en total
          </div>
        )}
      </div>
    </AppLayout>
  );
}
