-- ============================================================
-- Migración 004: Tabla PAI (Plan de Atención Individualizada)
-- ============================================================
-- Ejecutar con SET search_path TO centro_<slug>, shared, public;
-- antes de aplicar por cada centro.
-- ============================================================

CREATE TABLE IF NOT EXISTS pai (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador','revision','aprobado','archivado')),
  contenido JSONB NOT NULL,
  borrador_ia BOOLEAN DEFAULT false,
  aprobado_por UUID,
  aprobado_en TIMESTAMPTZ,
  proxima_revision DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(residente_id, version)
);

CREATE INDEX IF NOT EXISTS idx_pai_residente ON pai(residente_id);
CREATE INDEX IF NOT EXISTS idx_pai_estado ON pai(estado);
