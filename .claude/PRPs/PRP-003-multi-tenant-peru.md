# PRP-003: Multi-Tenant + Motor Legal Peruano

> **Estado**: COMPLETADO
> **Fecha**: 2026-03-14
> **Proyecto**: Verioska - Centro de Mando Procesal Penal

---

## Objetivo

Evolucionar Verioska de una app mono-país (México/CNPP) a una plataforma multi-tenant con soporte para múltiples países, comenzando con Perú (NCPP). Incluir módulos de gestión de estudio (CRM, finanzas, agenda).

## Por Qué

| Problema | Solución |
|----------|----------|
| App solo sirve para México | Arquitectura multi-tenant por país |
| Abogados peruanos tienen los mismos dolores | Motor legal peruano (NCPP) con plazos específicos |
| No tienen base de jurisprudencia | RAG jurisprudencial (futuro) |
| No saben cómo cobrar | Cotizador + facturación por tramos procesales |
| Gestión del estudio en Excel | CRM + finanzas + agenda integrados |

**Valor de negocio**: Mercado x2 (México + Perú). Plataforma escalable a toda Latam.

## Qué

### Criterios de Éxito
- [x] Schema multi-tenant: país → despacho → usuarios → expedientes
- [x] Motor legal peruano (NCPP) con plazos correctos
- [x] Motor legal mexicano refactorizado como plugin configurable
- [ ] Registro de usuario con selección de país y despacho (pendiente UI signup)
- [x] Módulo CRM básico (clientes, prospectos)
- [x] Módulo financiero (pagos por tramo, gastos por caso)
- [x] `npm run build` exitoso

---

## Blueprint (Assembly Line)

### Fase 1: Schema Multi-Tenant ✅
**Archivo**: `migrations/001-multi-tenant.sql`
- `pais` en despachos y expedientes (DEFAULT 'MX')
- Constraints flexibles para etapas, audiencias, partes de ambos países
- Campos peruanos: carpeta_fiscal, expediente_judicial, complejidad
- Tablas CRM: clientes, cotizaciones, pagos, gastos
- **Pendiente**: Ejecutar migración cuando Docker esté activo

### Fase 2: Motor Legal Peruano (NCPP) ✅
**Archivo**: `src/features/plazos/services/motor-ncpp.ts`
- 26 plazos del NCPP: diligencias preliminares, inv. preparatoria, prisión preventiva, proceso inmediato, impugnación
- Complejidad: simple/complejo/crimen_organizado con plazos diferenciados
- Detención: policial 48h, preliminar judicial 72h, crimen organizado 15d
- Recursos: reposición 2d, apelación auto 3d, apelación sentencia 5d, casación 10d

### Fase 3: Refactorizar Motor Legal como Plugin ✅
**Archivo**: `src/lib/paises/index.ts`
- ConfigPais con: código, terminología, etapas, audiencias, partes, plazos, moneda
- getConfigPais(), getEtapasPorPais(), getPlazosPorPais()
- API de plazos detecta país y usa motor correcto automáticamente

### Fase 4: Adaptar UI para Multi-País ✅
**Archivos**: labels.ts, formularios, detalle expediente, lista expedientes
- Labels centralizados en `src/lib/paises/labels.ts`
- Formulario nuevo expediente con selector de país (🇲🇽/🇵🇪)
- Formularios de partes y audiencias reciben prop `pais`
- Banderas en lista de expedientes y detalle
- Fechas peruanas: denuncia, formalización, complejidad

### Fase 5: Módulo CRM + Finanzas ✅
**APIs**: `/api/clientes`, `/api/expedientes/[id]/pagos`, `/api/expedientes/[id]/gastos`
**UI**: `/clientes` (página CRM), PagosPanel, GastosPanel en detalle expediente
- Clientes con estados CRM: prospecto, activo, inactivo, archivado
- Pagos con métodos por país (Yape/Plin para PE)
- Gastos por caso con categorías (peritaje, copias, movilidad, tasa judicial)
- Navegación: Clientes agregado al sidebar

### Fase 6: Validación Final ✅
- Build exitoso: 32 rutas (17 estáticas, 15 dinámicas)
- Sin errores TypeScript
- Estrategias adaptadas al NCPP peruano

---

## Aprendizajes (Self-Annealing)

1. **Constraints flexibles**: Usar un solo CHECK con todos los valores de ambos países funciona bien
2. **No renombrar columnas**: Mejor mantener `articulos_cnpp` que renombrar a `articulos_codigo` para no romper queries existentes
3. **Labels centralizados**: Un solo archivo `labels.ts` con todos los labels de ambos países evita duplicación
4. **Complejidad como valor simple no mutable**: `crimen_organizado` (no `criminalidad_organizada`) - mantener consistencia entre SQL y código
5. **Motor legal como catálogo**: Cada país es un Record<string, PlazoConfig> que se inyecta según `pais` del expediente

---

## Gotchas
- [x] Plazos peruanos son en días naturales vs días hábiles - implementado con diasHabiles: false/true
- [x] NCPP tiene más etapas que CNPP - schema flexible con CHECK expandido
- [x] Proceso Inmediato peruano tiene plazos muy cortos (48h/72h) - implementado
- [x] Prisión preventiva tiene plazos diferentes por complejidad - 9m/18m/36m

## Anti-Patrones
- NO duplicar código entre motores legales ✅ (comparten PlazoConfig e interfaz)
- NO hardcodear país en ningún componente ✅ (prop `pais` desde expediente)
- NO crear tablas separadas por país ✅ (mismas tablas, campo `pais`)
- NO romper funcionalidad existente de México ✅ (DEFAULT 'MX', build pasa)
