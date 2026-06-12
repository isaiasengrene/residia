CREATE TABLE IF NOT EXISTS credenciales_inspeccion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,       -- 8-char alphanumeric code
  creado_por UUID NOT NULL,           -- ADMIN_CENTRO who created it
  valido_desde TIMESTAMPTZ DEFAULT NOW(),
  valido_hasta TIMESTAMPTZ NOT NULL,  -- max 72 hours
  usado_en TIMESTAMPTZ,
  ip_uso INET,
  activo BOOLEAN DEFAULT true,
  ambito TEXT DEFAULT 'completo',     -- 'completo' | 'incidencias' | 'pai'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
