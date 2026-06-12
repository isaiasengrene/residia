-- Accesos del portal familiar (nivel centro, dentro del schema del centro)
CREATE TABLE IF NOT EXISTS accesos_familiares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id UUID NOT NULL,
  nombre_familiar TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  relacion TEXT NOT NULL,           -- 'hijo/a', 'cónyuge', 'hermano/a', 'tutor_legal', 'otro'
  activo BOOLEAN DEFAULT true,
  token_acceso TEXT,                -- token de acceso por enlace (opcional)
  token_expira TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_acceso_familiar_email_residente
  ON accesos_familiares(email, residente_id);
