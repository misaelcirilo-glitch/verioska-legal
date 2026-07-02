-- ============================================
-- Migración 006: Partes — cliente principal + sync inversa
-- PRP-005 · Fase 3
-- ============================================
-- Idempotente (IF NOT EXISTS). Segura de re-ejecutar.

-- 1. Formalizar schema drift: `partes.cliente_id` ya se usa en el código
--    (api/expedientes/[id]/partes: GET hace LEFT JOIN y POST lo inserta),
--    pero no estaba en ninguna migración versionada -> en la BD local no
--    existía y rompía el GET de partes.
ALTER TABLE partes ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;

-- 2. Flag explícito de "cliente principal del expediente".
--    Antes el principal era implícito por rol (ROLES_PRINCIPALES). Ahora es
--    un marcado explícito por parte; el expediente apunta a un único cliente.
ALTER TABLE partes ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT false;

-- 3. Timestamp de actualización (para PATCH).
ALTER TABLE partes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Índice para el JOIN partes -> clientes.
CREATE INDEX IF NOT EXISTS idx_partes_cliente ON partes(cliente_id);
