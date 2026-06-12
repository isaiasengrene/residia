-- =============================================================
-- ResidIA — Tabla de configuración de modelos IA
-- Migración 003: modelos_ia
-- =============================================================
-- Las API keys se cifran con AES-256-CBC en la capa de aplicación
-- antes de almacenar (NestJS crypto, no pgcrypto).

CREATE TABLE IF NOT EXISTS shared.modelos_ia (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  proveedor           TEXT        NOT NULL CHECK (proveedor IN ('anthropic', 'openai', 'google')),
  modelo              TEXT        NOT NULL,
  alias               TEXT,
  agente              TEXT        NOT NULL CHECK (agente IN ('registro', 'comunicacion', 'seguimiento', 'pai', 'todos')),
  api_key_cifrada     TEXT        NOT NULL,  -- cifrada con AES-256-CBC via Node.js crypto
  activo              BOOLEAN     DEFAULT false,
  latencia_ms_promedio INTEGER,              -- actualizado por el servicio IA tras cada llamada
  llamadas_totales    INTEGER     DEFAULT 0,
  errores_totales     INTEGER     DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proveedor, modelo, agente)
);

-- Solo puede haber un modelo activo por agente (excepto 'todos' que es global)
CREATE UNIQUE INDEX IF NOT EXISTS idx_modelo_activo_por_agente
  ON shared.modelos_ia (agente)
  WHERE activo = true AND agente != 'todos';
