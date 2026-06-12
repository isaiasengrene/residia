-- Habilitar extensión pgvector (requiere imagen pgvector/pgvector:pg16)
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de embeddings pseudonimizados para búsqueda semántica
-- Los embeddings se generan de texto pseudonimizado — nunca de datos reales
CREATE TABLE IF NOT EXISTS embeddings_incidencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incidencia_id UUID NOT NULL,
  embedding vector(1536),  -- dimensión para text-embedding-3-small
  texto_pseudonimizado TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_vector
  ON embeddings_incidencias USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
