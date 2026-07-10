-- ============================================
-- Migración 008: Escritos IA + drift plantillas_despacho.materia
-- PRP-005 · Fase 5 (modo IA, antes diferido)
-- ============================================
-- Idempotente (IF NOT EXISTS). Segura de re-ejecutar.

-- 1. Formalizar schema drift: `plantillas_despacho.materia` ya se usa en el
--    código (api/configuracion/plantillas POST/PUT lo inserta y filtra, y la
--    UI de Configuración → Plantillas lo edita), pero NUNCA se creó en la
--    migración 004 -> en una BD limpia el INSERT de plantillas revienta con
--    "column materia does not exist".
ALTER TABLE plantillas_despacho ADD COLUMN IF NOT EXISTS materia VARCHAR(50);

-- 2. El modo IA de escritos reutiliza las columnas de la migración 007:
--    `origen` (VARCHAR(20), acepta 'ia') y `campos` (JSONB, snapshot de las
--    variables editables usadas). No requieren cambios de esquema; esta
--    migración solo documenta que ahora sí se escriben desde el código.
--    (Ver escritos/route.ts: INSERT incluye campos; origen puede ser 'ia'.)
