-- ============================================
-- Migración 005: Fundación de datos + Fix Gastos/Pagos
-- PRP-005 · Fase 1
-- ============================================
-- Idempotente (IF NOT EXISTS / IF EXISTS). Segura de re-ejecutar.

-- 1. Formalizar schema drift: `materia` se usa en el código
--    (api/expedientes) pero no estaba en ninguna migración versionada.
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS materia VARCHAR(50);

-- 2. Backfill de `despacho_id` en expedientes.
--    Raíz del bug: los expedientes se creaban sin despacho_id (NULL), y
--    gastos/pagos.despacho_id son NOT NULL -> el INSERT reventaba (500).
--    Esto también corrige la inconsistencia de tenancy (listado por despacho,
--    detalle por user_id).
UPDATE expedientes e
   SET despacho_id = u.despacho_id
  FROM users u
 WHERE e.user_id = u.id
   AND e.despacho_id IS NULL;

-- 3. Permitir registrar pagos aunque el expediente aún no tenga cliente
--    asignado (antes cliente_id era NOT NULL y bloqueaba el registro).
ALTER TABLE pagos ALTER COLUMN cliente_id DROP NOT NULL;

-- 4. `despacho_id` nullable en gastos/pagos.
--    El layer de despachos hoy está sin poblar (no hay despachos, el signup no
--    crea ninguno), así que despacho_id llega NULL y su NOT NULL bloqueaba todo
--    registro de finanzas. El control de acceso real se hace por ownership del
--    expediente (verifyOwnership por user_id), no por despacho_id: aquí es solo
--    metadato. Se guarda cuando se puede resolver; si no, queda NULL.
--    (Provisionar despachos por usuario es una iniciativa aparte — "Mi Despacho".)
ALTER TABLE gastos ALTER COLUMN despacho_id DROP NOT NULL;
ALTER TABLE pagos ALTER COLUMN despacho_id DROP NOT NULL;

-- Verificación rápida (informativa, no rompe si no aplica):
-- SELECT COUNT(*) FILTER (WHERE despacho_id IS NULL) AS exp_sin_despacho FROM expedientes;
