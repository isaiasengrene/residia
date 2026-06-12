-- ============================================================
-- Migración 001: Añadir tabla turnos con campos extendidos
-- ============================================================
-- NOTA: Esta migración añade los campos que la API de turnos requiere
-- (tipo, estado, profesional_id, profesional_nombre, fin, firma_hash, traspaso_resumen).
-- La tabla original en provisionar_centro solo tiene campos básicos.
--
-- Ejecutar con SET search_path TO centro_<slug>, shared, public;
-- antes de aplicar esta migración por cada centro.
--
-- PENDIENTE: Actualizar la función shared.provisionar_centro en
-- 01_schema_shared.sql para incluir esta definición completa, de modo
-- que nuevos centros se aprovisionen correctamente desde el inicio.
-- ============================================================

-- Añadir tabla turnos al schema del centro
CREATE TABLE IF NOT EXISTS turnos (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo              TEXT        NOT NULL CHECK (tipo IN ('mañana', 'tarde', 'noche')),
  fecha             DATE        NOT NULL DEFAULT CURRENT_DATE,
  inicio            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fin               TIMESTAMPTZ,
  profesional_id    UUID        NOT NULL,
  profesional_nombre TEXT       NOT NULL,
  estado            TEXT        NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'traspasado')),
  notas             TEXT,
  firma_hash        TEXT,
  traspaso_resumen  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turnos_profesional ON turnos(profesional_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha       ON turnos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_turnos_estado      ON turnos(estado);
