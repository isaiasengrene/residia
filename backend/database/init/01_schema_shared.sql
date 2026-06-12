-- =============================================================
-- ResidIA — Esquema compartido y provisión de centros
-- =============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Esquema compartido
CREATE SCHEMA IF NOT EXISTS shared;

-- ------------------------------------------------------------------
-- Tipo enumerado: perfiles de usuario
-- ------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'perfil_usuario') THEN
    CREATE TYPE shared.perfil_usuario AS ENUM (
      'SUPERADMIN',
      'ADMIN_CENTRO',
      'COORDINADOR',
      'SANITARIO',
      'AUXILIAR',
      'TRABAJADOR_SOCIAL',
      'FAMILIAR',
      'INSPECTOR'
    );
  END IF;
END$$;

-- ------------------------------------------------------------------
-- Tabla: centros
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared.centros (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  activo      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------
-- Tabla: usuarios
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared.usuarios (
  id              UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_id       UUID                   NOT NULL REFERENCES shared.centros(id) ON DELETE CASCADE,
  email           TEXT                   NOT NULL UNIQUE,
  password_hash   TEXT                   NOT NULL,
  nombre          TEXT                   NOT NULL,
  apellidos       TEXT                   NOT NULL,
  perfil          shared.perfil_usuario  NOT NULL,
  totp_secret     TEXT,
  activo          BOOLEAN                NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_centro ON shared.usuarios(centro_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email  ON shared.usuarios(email);

-- ------------------------------------------------------------------
-- Función: provisionar_centro
-- Crea el esquema propio del centro con todas las tablas necesarias
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION shared.provisionar_centro(centro_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  schema_name TEXT := 'centro_' || centro_slug;
BEGIN
  -- Crear el esquema del centro
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

  -- ------------------------------------------------------------------
  -- Tabla: residentes
  -- ------------------------------------------------------------------
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.residentes (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre           TEXT        NOT NULL,
      apellidos        TEXT        NOT NULL,
      fecha_nacimiento DATE        NOT NULL,
      habitacion       TEXT,
      activo           BOOLEAN     NOT NULL DEFAULT TRUE,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  ', schema_name);

  -- ------------------------------------------------------------------
  -- Tabla: incidencias
  -- ------------------------------------------------------------------
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.incidencias (
      id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      residente_id      UUID        REFERENCES %I.residentes(id) ON DELETE SET NULL,
      tipo              TEXT        NOT NULL,
      descripcion       TEXT        NOT NULL,
      area              TEXT,
      prioridad         TEXT        NOT NULL CHECK (prioridad IN (''alta'', ''media'', ''baja'')),
      informa           TEXT,
      origen            TEXT        NOT NULL CHECK (origen IN (''web'', ''whatsapp'', ''voz'')),
      estado            TEXT        NOT NULL DEFAULT ''abierta'',
      accion_requerida  BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      closed_at         TIMESTAMPTZ
    )
  ', schema_name, schema_name);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_incidencias_residente ON %I.incidencias(residente_id)', schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_incidencias_estado    ON %I.incidencias(estado)', schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_incidencias_prioridad ON %I.incidencias(prioridad)', schema_name);

  -- ------------------------------------------------------------------
  -- Tabla: audit_log (cadena de hashes para integridad)
  -- ------------------------------------------------------------------
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.audit_log (
      id              BIGSERIAL   PRIMARY KEY,
      hash_anterior   TEXT,
      hash_propio     TEXT        NOT NULL,
      timestamp_utc   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      accion          TEXT        NOT NULL,
      usuario_id      UUID,
      recurso_tipo    TEXT,
      recurso_id      TEXT,
      payload         JSONB,
      ip_origen       INET
    )
  ', schema_name);

  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_audit_usuario   ON %I.audit_log(usuario_id)', schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_audit_recurso   ON %I.audit_log(recurso_tipo, recurso_id)', schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON %I.audit_log(timestamp_utc DESC)', schema_name);

  -- ------------------------------------------------------------------
  -- Tabla: consentimientos
  -- ------------------------------------------------------------------
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.consentimientos (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      residente_id    UUID        REFERENCES %I.residentes(id) ON DELETE CASCADE,
      version         INT         NOT NULL DEFAULT 1,
      estado          TEXT        NOT NULL CHECK (estado IN (''activo'', ''retirado'', ''pendiente'')),
      fecha_firma     TIMESTAMPTZ,
      firmante_nombre TEXT,
      firmante_rol    TEXT,
      ip_firma        INET,
      pdf_hash        TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  ', schema_name, schema_name);

  -- ------------------------------------------------------------------
  -- Tabla: expedientes (historial clínico)
  -- ------------------------------------------------------------------
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.expedientes (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      residente_id    UUID        NOT NULL REFERENCES %I.residentes(id) ON DELETE CASCADE,
      tipo            TEXT        NOT NULL,
      contenido       JSONB       NOT NULL DEFAULT ''{}''::JSONB,
      autor_id        UUID,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  ', schema_name, schema_name);

  -- ------------------------------------------------------------------
  -- Tabla: pai (Plan de Atención Individualizado)
  -- ------------------------------------------------------------------
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.pai (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      residente_id    UUID        NOT NULL REFERENCES %I.residentes(id) ON DELETE CASCADE,
      version         INT         NOT NULL DEFAULT 1,
      objetivos       JSONB       NOT NULL DEFAULT ''[]''::JSONB,
      intervenciones  JSONB       NOT NULL DEFAULT ''[]''::JSONB,
      estado          TEXT        NOT NULL DEFAULT ''borrador'',
      autor_id        UUID,
      aprobado_por    UUID,
      fecha_revision  DATE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  ', schema_name, schema_name);

  -- ------------------------------------------------------------------
  -- Tabla: turnos
  -- ------------------------------------------------------------------
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.turnos (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario_id      UUID        NOT NULL,
      fecha           DATE        NOT NULL,
      hora_inicio     TIME        NOT NULL,
      hora_fin        TIME        NOT NULL,
      tipo_turno      TEXT        NOT NULL,
      observaciones   TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  ', schema_name);

  RAISE NOTICE 'Centro "%" aprovisionado correctamente en el esquema "%"', centro_slug, schema_name;
END;
$$;

-- ------------------------------------------------------------------
-- Seed inicial: Fundación Federico Ozanam
-- ------------------------------------------------------------------
INSERT INTO shared.centros (nombre, slug, activo)
VALUES ('Fundación Federico Ozanam', 'ozanam', TRUE)
ON CONFLICT (slug) DO NOTHING;

SELECT shared.provisionar_centro('ozanam');
