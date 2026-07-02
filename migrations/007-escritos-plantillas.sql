-- ============================================
-- Migración 007: Escritos — origen (plantilla propia / predefinida) + campos
-- PRP-005 · Fase 5
-- ============================================
-- Idempotente (IF NOT EXISTS). Segura de re-ejecutar.

-- Vincular un escrito a una plantilla del despacho (cuando se generó desde una).
ALTER TABLE escritos ADD COLUMN IF NOT EXISTS plantilla_id UUID REFERENCES plantillas_despacho(id) ON DELETE SET NULL;

-- Origen de la generación: 'predefinida' (motor interno) | 'plantilla_propia' | 'ia' (fase futura).
ALTER TABLE escritos ADD COLUMN IF NOT EXISTS origen VARCHAR(20) DEFAULT 'predefinida';

-- Snapshot de las variables sustituidas (para trazabilidad / re-generación).
ALTER TABLE escritos ADD COLUMN IF NOT EXISTS campos JSONB;
