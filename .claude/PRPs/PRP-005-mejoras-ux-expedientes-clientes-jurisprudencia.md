# PRP-005: Mejoras UX — Expedientes, Clientes y Jurisprudencia

> **Estado**: EN PROGRESO (Fase 1) — aprobado 2026-07-02 con 3 defaults confirmados
> **Fecha**: 2026-07-02
> **Proyecto**: Verioska Legal (saas-abogados-mexico)
> **Stack**: Next.js 16 + React 19 + Neon PostgreSQL (`pg`) + JWT custom (jose) + Zod. Multi-tenant `despacho_id`, multi-país MX/PE. (Legacy — NO Supabase.)

---

## Objetivo

Cerrar 9 brechas de experiencia de usuario detectadas por el cliente en los módulos de **Expedientes** (edición/eliminación, partes, dosificación, gastos/pagos, escritos), **Clientes** (edición/eliminación) y **Jurisprudencia** (resultados y detalle), respetando permisos por rol y la arquitectura legacy existente.

## Por Qué

| Problema (reportado por el cliente) | Solución |
|---|---|
| No se puede editar/eliminar expedientes ni clientes | CRUD completo con permisos por rol y borrado seguro |
| No se pueden editar partes; doble registro con Clientes | Editar partes + flag "cliente principal" + sync bidireccional |
| Dosificación muestra delitos ajenos a la materia | Filtrar delitos por materia/país del expediente |
| **Gastos y Pagos no se pueden registrar** (bug) | Corregir `despacho_id` NULL que rompe el INSERT |
| Escritos no usan las plantillas cargadas | Integrar plantilla propia / predefinida / IA |
| Jurisprudencia devuelve 1 solo resultado | Corregir el filtro + vista de detalle con texto íntegro |

**Valor de negocio**: elimina bloqueos operativos (finanzas caídas, datos no editables → errores permanentes) y reduce doble digitación. Impacta directamente la retención del despacho cliente.

---

## Qué — Diagnóstico real (mapeado en código) y Criterios de Éxito

### 1a. Editar/eliminar Expedientes
**Estado real**: el backend **YA existe** — `PUT` y `DELETE` en `src/app/api/expedientes/[id]/route.ts:60,128`. **Falta toda la UI.** Inconsistencia: `[id]` filtra por `user_id` (route.ts:7) pero la lista es por `despacho_id`.
- [ ] Botón/modal **Editar** en el detalle (`expedientes/[id]/page.tsx:106-194`) que consume el PUT existente.
- [ ] Botón **Eliminar** con confirmación (soft-delete → `estado='archivado'`; hard-delete solo admin).
- [ ] Tenancy alineada a `despacho_id` + control por rol (patrón `equipo/[id]/route.ts:30`).

### 1b. Gestión de Partes + sync bidireccional
**Estado real**: `partes/route.ts` solo `GET`/`POST` (no editar/eliminar). El "cliente principal" hoy es **implícito por rol** (`ROLES_PRINCIPALES`, route.ts:29,96-102), sin flag. Sync existente = **Parte→Expediente** (escribe `expedientes.cliente_id`). **NO existe Parte→Cliente.** `partes.cliente_id` es *schema drift* (se usa, no está en migraciones).
- [ ] Ruta nueva `partes/[parteId]/route.ts` con `PATCH` + `DELETE`.
- [ ] UI editar parte + **checkbox "Marcar como cliente principal"**.
- [ ] Sync inversa: al marcar una parte manual como cliente principal → crear/actualizar fila en `clientes` y vincular `partes.cliente_id`.

### 1c. Dosificación coherente con la materia
**Estado real**: catálogo de **24 delitos** (`calculador-penas.ts`) filtrado **solo por país**; todos son penales. El expediente tiene `materia` pero **nunca llega al filtro** (`dosificacion/route.ts:45` llama `buscarDelitos(pais)` sin materia).
- [ ] Clasificar el catálogo por materia (campo nuevo en `RangoPena`).
- [ ] Propagar `expediente.materia` → `buscarDelitos()` y filtrar.
- [ ] Si la materia no es penal: ocultar el panel o mostrar aviso claro (no ofrecer delitos penales).

### 1d. Gastos y Pagos (BUG crítico)
**Causa raíz encontrada**: los expedientes se crean **sin `despacho_id`** (`expedientes/route.ts:79-102` lo omite → queda NULL). `gastos`/`pagos.despacho_id` son **NOT NULL** (`001-multi-tenant.sql:159,181`) → el INSERT lanza 500. El panel de gastos **silencia el error** (`gastos-panel.tsx:63`). Secundario: pagos exige `cliente_id` o da 400 (`pagos/route.ts:70-72`).
- [ ] Poblar `despacho_id` al crear expediente (desde `session.despachoId`).
- [ ] Backfill de expedientes existentes con `despacho_id` NULL.
- [ ] Guard defensivo en gastos/pagos (derivar `despacho_id` de la sesión).
- [ ] Permitir pago sin cliente (o mensaje claro) + mostrar errores en `gastos-panel`.
- [ ] **Registrar un gasto y un pago end-to-end sin error.**

### 1e. Escritos con plantillas + IA (3 modos)
**Estado real**: **dos islas** — `generador-escritos.ts` usa un `switch` de plantillas **hardcodeadas** (sin IA, sin BD); la tabla `plantillas_despacho` (CRUD real en Configuración) **nunca se usa** para generar. No hay `plantilla_id` en `escritos`. El patrón IA/OpenRouter existe en `cerebro/route.ts:178-216` (con fallback sin key).
- [ ] Selector de 3 modos: **plantilla propia** / **predefinida** / **generar con IA**.
- [ ] Motor de sustitución `{{campo}}` con datos del expediente/partes.
- [ ] Plantillas predefinidas convertidas en datos editables (semilla).
- [ ] Rama IA reusando el patrón de `cerebro` (con fallback) + campos editables.

### 2. Editar/eliminar Clientes
**Estado real**: `clientes/[id]/route.ts` solo `GET`. Falta backend y UI.
- [ ] `PUT`/`PATCH` + `DELETE` (soft-delete → `estado='inactivo'/'archivado'`) reusando `clienteSchema`.
- [ ] UI editar/eliminar en `clientes/[id]/page.tsx` y/o lista.

### 3. Jurisprudencia — resultados + detalle
**Causa raíz de "1 solo resultado"**: al hacer clic en un chip de tema (`jurisprudencia-panel.tsx:191`) se setean **a la vez** `tema` y `consulta`; el filtro por `tema` (AND) exige coincidencia en etiquetas casi únicas por tesis → suele quedar 1. Catálogo real = **44 tesis** (22 MX + 22 PE). El campo `texto` **es** el texto que guarda el sistema (síntesis curada, no la resolución oficial completa).
- [ ] Corregir el chip para no forzar `tema` AND `consulta` (OR / solo texto) + relajar filtro `tema` y umbral `_score` (`catalogo-jurisprudencia.ts:726-731,752`).
- [ ] Página de detalle `/jurisprudencia/[id]` con `texto` íntegro, abrible en **nueva pestaña** (`target="_blank"`).
- [ ] **Decisión de alcance**: hoy solo existe la síntesis curada; si se requiere el texto oficial completo hay que ampliar la fuente de datos (fuera de este PRP salvo que se apruebe).

---

## Contexto

### Referencias de patrones existentes
- Control por rol: `src/app/api/equipo/[id]/route.ts:30` (`if (rol !== 'admin') 403`).
- IA + fallback: `src/app/api/expedientes/[id]/cerebro/route.ts:178-216`.
- CRUD plantillas: `src/app/api/configuracion/plantillas/**` + `plantillas-tab.tsx`.
- PUT dinámico con whitelist: `expedientes/[id]/route.ts:81-119`.

### Schema drift a formalizar (⚠️ crítico)
Columnas usadas en código pero **ausentes de migraciones versionadas**: `expedientes.materia`, `partes.cliente_id`, `plantillas_despacho.materia`. La migración nueva debe crearlas con `IF NOT EXISTS` para no romper el ambiente actual de Neon.

### Modelo de datos — Migración `005-mejoras-ux.sql` (propuesta)
```sql
-- Formalizar drift (idempotente)
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS materia VARCHAR(50);
ALTER TABLE partes ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE plantillas_despacho ADD COLUMN IF NOT EXISTS materia VARCHAR(50);

-- Nuevas columnas
ALTER TABLE partes ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT false;
ALTER TABLE partes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE escritos ADD COLUMN IF NOT EXISTS plantilla_id UUID REFERENCES plantillas_despacho(id) ON DELETE SET NULL;
ALTER TABLE escritos ADD COLUMN IF NOT EXISTS origen VARCHAR(20) DEFAULT 'predefinida'; -- plantilla_propia | predefinida | ia
ALTER TABLE escritos ADD COLUMN IF NOT EXISTS campos JSONB;

-- Backfill despacho_id (raíz del bug de finanzas)
UPDATE expedientes e SET despacho_id = u.despacho_id
  FROM users u WHERE e.user_id = u.id AND e.despacho_id IS NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_partes_cliente ON partes(cliente_id);
```

---

## Blueprint (Assembly Line)

> Solo FASES. Las subtareas se generan al entrar a cada fase (bucle agéntico: mapear → subtareas → ejecutar → auto-blindaje).

### Fase 1: Fundación de datos + Fix Gastos/Pagos ✅ COMPLETADA (2026-07-02)
**Objetivo**: Migración `005` aplicada (drift + backfill `despacho_id`), `despacho_id` poblado al crear expediente, gastos y pagos registrables end-to-end.
**Validación**: ✅ Crear expediente → GASTO 201, PAGO sin cliente 201, GET gastos 200. `npx tsc --noEmit` limpio, `npm run build` exitoso.
**Archivos**: `migrations/005-fundacion-finanzas.sql`, `src/lib/db.ts` (`resolveDespachoId`), `src/app/api/expedientes/route.ts`, `.../[id]/gastos/route.ts`, `.../[id]/pagos/route.ts`, `src/features/finanzas/components/gastos-panel.tsx`.
**⚠️ Producción**: aplicar `migrations/005` a Neon al desplegar.

### Fase 2: CRUD Expedientes + Clientes ✅ COMPLETADA (2026-07-02)
**Objetivo**: Editar y eliminar (soft-delete) expedientes y clientes desde la UI, con permisos por rol y tenancy por `despacho_id`.
**Validación**: ✅ end-to-end (curl+BD): admin/abogado editan (200), abogado DELETE → 403, borrado de cliente con expediente → archiva, sin expediente → borrado físico. `tsc` + `build` limpios.
**Archivos**: `cliente-acciones.tsx`, `expediente-acciones.tsx`, `clientes/[id]/route.ts` (PUT/DELETE), `expedientes/[id]/route.ts` (guards rol).
**Fix incluido**: tenancy del detalle de expedientes alineada a `despacho_id` (antes solo `user_id` → 404 al colega). Ver aprendizaje.

### Fase 3: Partes — editar + cliente principal + sync inversa ✅ COMPLETADA (2026-07-02)
**Objetivo**: Editar/eliminar partes, marcar cliente principal, y sincronizar Parte→Cliente (crear/actualizar cliente desde parte).
**Validación**: ✅ end-to-end (curl+BD): editar parte (200), rol sin permiso (403), marcar principal manual → **crea cliente en CRM + vincula `partes.cliente_id` + `expediente.cliente_id`**, desmarcar → desvincula, DELETE (200). GET partes con JOIN funcionando. `tsc` + `build` limpios.
**Archivos**: `migrations/006-partes-cliente-principal.sql` (drift `cliente_id` + `es_principal` + `updated_at`), `partes/[parteId]/route.ts` (PATCH/DELETE + sync inversa), `partes-lista.tsx`, `partes/route.ts` (scoping despacho).
**⚠️ Producción**: aplicar `migrations/006` a Neon al desplegar.

### Fase 4: Dosificación por materia ✅ COMPLETADA (2026-07-02)
**Objetivo**: El selector de delitos solo muestra opciones coherentes con la materia/país del expediente; materias no penales no ofrecen delitos penales.
**Validación**: ✅ (curl+BD): materia penal MX → 12 delitos, `aplica:true`; materia civil → 0 delitos, `aplica:false`, POST calcular → 400; materia NULL → default penal. `tsc` + `build` limpios.
**Archivos**: `calculador-penas.ts` (`materia?` en `RangoPena` + filtro en `buscarDelitos`), `dosificacion/route.ts` (trae `materia`, devuelve `aplica`, bloquea POST no penal), `dosificacion-panel.tsx` (aviso cuando no aplica).
**Nota**: catálogo actual es 100% penal; `materia ?? 'penal'`. Ampliar a otras materias es dato nuevo, fuera de este PRP.

### Fase 5: Escritos — plantilla propia / predefinida ✅ COMPLETADA (2026-07-02) · IA diferida
**Objetivo**: Generar escritos desde plantilla del despacho (con sustitución `{{campo}}`) o desde predefinidas.
**Decisión (usuario)**: el modo **IA queda fuera de esta fase** (no hay `OPENROUTER_API_KEY`); se hará como fase aparte cuando exista la key. Se implementaron 2 modos.
**Validación**: ✅ (curl+BD): predefinida → 201; predefinida sin tipo → 400; plantilla propia sustituye `{{campo}}` (incluye espacios `{{ juzgado }}`, marca desconocidos como `[CAMPO]`), guarda `origen`/`plantilla_id`; GET incluye plantillas del despacho. `tsc`+`build` OK.
**Archivos**: `migrations/007-escritos-plantillas.sql` (`plantilla_id`, `origen`, `campos`), `generador-escritos.ts` (`construirVariables` + `sustituirPlantilla`), `escritos/route.ts` (2 modos + scoping despacho + plantillas en GET), `escritos-panel.tsx` (selector de modo).

### Fase 6: Jurisprudencia — múltiples resultados + detalle
**Objetivo**: Las búsquedas por tema devuelven todos los resultados relevantes; el detalle abre en nueva pestaña con el texto íntegro.
**Validación**: Un tema con ≥2 tesis muestra todas; clic en resultado abre `/jurisprudencia/[id]` en nueva pestaña.

### Fase 7: Validación Final
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright confirma cada criterio de éxito
- [ ] Commit/tag de fase, aprendizajes documentados

---

## 🧠 Aprendizajes (Self-Annealing)

### 2026-07-02: Fase 1 — El layer de despachos estaba muerto (raíz de finanzas)
- **Error**: Gastos y Pagos daban 500/400. Causa raíz real: **no existe ningún despacho**, el signup (`api/auth/signup`) NO crea uno ni asigna `users.despacho_id`, y el token no lleva `despachoId`. Por eso `expedientes.despacho_id` siempre era NULL y `gastos/pagos.despacho_id` (NOT NULL) reventaban el INSERT.
- **Fix**: El control de acceso de finanzas se hace por *ownership del expediente* (`verifyOwnership` por `user_id`), no por `despacho_id` → ahí es solo metadato. Se volvió `despacho_id` **nullable** en `gastos`/`pagos` (mig. 005) + derivación defensiva (`resolveDespachoId`). También `pagos.cliente_id` pasó a nullable (bloqueaba pagos sin cliente).
- **Aplicar en**: Cualquier tabla multi-tenant que herede `despacho_id` de expedientes. Provisionar despachos por usuario es una iniciativa separada ("Mi Despacho"), NO mezclarla con fixes de UX.

### 2026-07-02: No existe script `npm run typecheck`
- **Error**: `npm run typecheck` → "Missing script". package.json solo tiene dev/build/start/lint.
- **Fix**: Usar `npx tsc --noEmit` directamente.
- **Aplicar en**: Este proyecto (Verioska Legal).

### 2026-07-02: Fase 2 — Tenancy inconsistente (detalle por user_id, listado por despacho)
- **Error**: El listado de expedientes filtra por `user_id OR despacho_id`, pero el detalle (GET/PUT/DELETE de `[id]` y el server `page.tsx`) filtraba solo por `user_id`. Un colega del mismo despacho veía el expediente en la lista pero recibía 404 al abrirlo/editarlo → las acciones CRUD por rol quedaban inservibles para admin sobre expedientes ajenos.
- **Fix**: Mismo predicado en listado y detalle: `WHERE id=$1 AND (user_id=$2 OR despacho_id=(SELECT despacho_id FROM users WHERE id=$2))`. Aplicado en `verifyOwnership` (expedientes y partes), GET detalle API y `page.tsx`. Clientes ya lo hacía bien.
- **Aplicar en**: Toda entidad multi-tenant — el scoping del detalle DEBE coincidir con el del listado.

### 2026-07-02: Fase 3 — `partes.cliente_id` era schema drift (rompía el GET local)
- **Error**: `partes/route.ts` GET hace `LEFT JOIN clientes ON p.cliente_id` y POST lo inserta, pero la columna no existía en migraciones → en la BD local el GET de partes fallaba.
- **Fix**: `migrations/006` formaliza `cliente_id` + añade `es_principal` y `updated_at` (IF NOT EXISTS). Sync inversa: al marcar una parte manual como principal se crea el cliente en CRM (`fuente='directorio'`), se vincula `partes.cliente_id` y `expediente.cliente_id`; se garantiza un único principal por expediente.
- **Aplicar en**: Formalizar SIEMPRE columnas usadas en código con migración `IF NOT EXISTS`; no confiar en el drift de Neon para la BD local.

### 2026-07-02: Fase 5 — Migraciones 004 y 006 nunca aplicadas a la BD local
- **Error**: `plantillas_despacho` (mig. 004) no existía en la BD local → el CRUD de Configuración/Plantillas y el modo "plantilla propia" de escritos fallaban (500). Igual pasó con las columnas de `partes` (mig. 006). La BD local iba atrasada respecto a las migraciones del repo.
- **Fix**: Aplicar las migraciones pendientes con `docker exec -i verioska-db psql ... < migrations/00X.sql` (idempotentes). No hay tabla de tracking de migraciones → verificar con `SELECT tablename FROM pg_tables` / `information_schema.columns` antes de asumir que una columna/tabla existe.
- **Aplicar en**: Antes de tocar una feature, confirmar que su tabla/columna existe en la BD local; no confiar en que el drift de Neon esté replicado local.

### 2026-07-02: BD local de dev = Docker `verioska-db`
- **Nota**: dev usa Postgres local en Docker (`localhost:5432/verioska`, user `verioska`, pass `verioska_dev_2026`), separado de la Neon de producción. El contenedor `verioska-db` debe estar corriendo (arrancar Docker Desktop). Producción (Neon) requiere aplicar la migración 005 por separado al desplegar.

---

## Gotchas
- [ ] **`despacho_id` NULL** es la raíz de finanzas Y de la inconsistencia de tenancy — arreglarlo primero (Fase 1) desbloquea varios puntos.
- [ ] **Schema drift**: `expedientes.materia`, `partes.cliente_id`, `plantillas_despacho.materia` existen en Neon pero no en migraciones → usar `IF NOT EXISTS`.
- [ ] **IA de escritos** requiere `OPENROUTER_API_KEY` en Vercel (pendiente según memoria) → mantener fallback sin key.
- [ ] **Jurisprudencia**: el "texto íntegro" hoy es síntesis curada, no la resolución oficial completa. Confirmar expectativa antes de prometer el documento completo.
- [ ] **Borrado de registros legales**: preferir soft-delete (archivar) sobre DELETE físico por seguridad/auditoría.
- [ ] Zod v4 → `error.issues`. Next 16 → `await params`. `updated_at = NOW()` en cada UPDATE.

## Decisiones que requieren tu visto bueno (antes de ejecutar)
1. **Eliminar = archivar (soft-delete) por defecto**, y borrado físico solo para rol `admin`. ¿OK?
2. **Permisos**: editar → `admin` + `abogado`; archivar/eliminar → `admin`. ¿OK o ajustamos?
3. **Jurisprudencia**: mostramos el texto que existe (síntesis curada) en el detalle. Traer el texto oficial completo sería otro esfuerzo (fuera de este PRP). ¿OK así?

---

## Anti-Patrones
- NO migrar el backend legacy a Supabase.
- NO `any` (usar `unknown`), NO omitir Zod, NO hardcodear.
- NO renombrar columnas existentes; solo `ADD COLUMN IF NOT EXISTS`.

---

*PRP pendiente de aprobación. No se ha modificado código.*
