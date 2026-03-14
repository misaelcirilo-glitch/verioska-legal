# PRP-002: Defensa IA

> **Estado**: COMPLETADO
> **Fecha**: 2026-03-08
> **Proyecto**: Verioska - Centro de Mando Procesal Penal

---

## Objetivo

Dotar al abogado de herramientas de IA para analizar contradicciones entre declaraciones, generar estrategias de defensa con fundamento CNPP, producir escritos legales automatizados y consultar el expediente completo mediante RAG juridico.

## Por Que

| Problema | Solucion |
|----------|----------|
| Comparar declaraciones manualmente toma horas y se pierden inconsistencias | Detector automatico de contradicciones entre declaraciones |
| Abogados novatos no conocen todas las estrategias del CNPP | Sugerencias de estrategia con fundamento legal automatico |
| Redactar escritos legales es repetitivo y propenso a errores | Generador de escritos con plantillas y datos del expediente |
| No se puede buscar informacion especifica en expedientes grandes | RAG juridico para consultas en lenguaje natural |

**Valor de negocio**: Analisis de expediente completo en menos de 5 minutos. Deteccion de contradicciones que un humano tardaria horas en encontrar. Escritos legales en segundos.

## Que

### Criterios de Exito
- [x] Analisis de contradicciones entre declaraciones del mismo expediente
- [x] Sugerencias de estrategia basadas en etapa procesal y hechos
- [x] Generacion de escritos legales con datos del expediente
- [x] Consultas en lenguaje natural contra documentos del expediente (RAG)
- [x] `npm run build` exitoso

### Comportamiento Esperado (Happy Path)
1. Abogado sube declaraciones ministeriales y judiciales (ya implementado en PRP-001)
2. Sistema detecta contradicciones automaticamente al procesar documentos
3. Abogado ve panel de contradicciones con severidad y utilidad defensiva
4. Abogado solicita sugerencia de estrategia > sistema analiza hechos + etapa + CNPP
5. Abogado genera escrito legal > sistema llena plantilla con datos del expediente
6. Abogado pregunta al expediente en lenguaje natural > RAG responde con fuentes

---

## Contexto

### Referencias
- `src/features/documentos/` - Upload y OCR ya implementados (PRP-001)
- `src/features/cronologia/` - Timeline ya implementada (PRP-001)
- `schema.sql` - Tablas `declaraciones`, `contradicciones`, `estrategias`, `escritos` ya en BD
- `CLAUDE.md` - AI Engine: Vercel AI SDK v5 + OpenRouter
- `.claude/ai_templates/_index.md` - Templates de IA

### Arquitectura Propuesta (Feature-First)
```
src/features/
  contradicciones/
    components/     # ContradiccionesPanel, ContradiccionCard
    services/       # analizador de contradicciones
    types/
  estrategia/
    components/     # EstrategiaPanel, SugerenciaCard
    services/       # generador de estrategias
    types/
  escritos/
    components/     # EscritoGenerator, PlantillaSelector
    services/       # generador de escritos
    types/
```

### Modelo de Datos
Tablas `declaraciones`, `contradicciones`, `estrategias`, `escritos` ya existen en PostgreSQL.
No se requieren migraciones de esquema.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo FASES. Subtareas se generan al entrar a cada fase (Just-In-Time).

### Fase 1: Analisis de contradicciones
**Objetivo**: Registrar declaraciones, comparar automaticamente y detectar contradicciones entre testimonios del mismo expediente
**Validacion**: Dos declaraciones ingresadas > contradicciones detectadas automaticamente

### Fase 2: Estrategia con fundamento CNPP
**Objetivo**: Generar sugerencias de estrategia basadas en etapa procesal, hechos y entidades del expediente
**Validacion**: Click "Generar estrategia" > sugerencias con fundamento legal aparecen

### Fase 3: Generacion de escritos legales
**Objetivo**: Producir escritos legales (amparos, apelaciones, recursos) con datos del expediente
**Validacion**: Seleccionar tipo de escrito > documento generado con datos reales del caso

### Fase 4: RAG juridico
**Objetivo**: Consultas en lenguaje natural contra todos los documentos del expediente
**Validacion**: Preguntar "que dijo el testigo X" > respuesta con fuente del documento

### Fase 5: Validacion Final
**Objetivo**: Sistema funcionando end-to-end
**Validacion**:
- [x] Contradicciones se detectan correctamente
- [x] Estrategias tienen fundamento CNPP valido
- [x] Escritos se generan con datos del expediente
- [x] RAG responde con fuentes correctas
- [x] `npm run build` exitoso

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

### 2026-03-08: RAG funcional sin pgvector ni embeddings
- **Decisión**: Implementar búsqueda por texto (word matching) como fallback cuando no hay pgvector
- **Beneficio**: El sistema funciona sin dependencias externas de IA. Se mejora con OpenRouter cuando hay API key
- **Aplicar en**: Cualquier feature de IA - siempre tener fallback funcional sin API key

### 2026-03-08: Dynamic import para AI SDK en Route Handlers
- **Decisión**: Usar `await import('ai')` dinámico en lugar de import estático para el AI SDK
- **Beneficio**: El build no falla si no hay API key, el SDK solo se carga cuando se necesita
- **Aplicar en**: Cualquier endpoint que use AI SDK opcionalmente

### 2026-03-08: Detector de contradicciones basado en reglas > IA
- **Decisión**: Usar NLP basado en reglas (negación/afirmación + similitud de palabras) en lugar de IA
- **Beneficio**: Funciona offline, sin costos, sin latencia. Suficiente para MVP
- **Aplicar en**: Features de análisis donde reglas simples cubren el 80% de casos

---

## Gotchas

- [ ] Vercel AI SDK v5 requiere API key de OpenRouter en env
- [ ] Streaming responses necesitan ReadableStream en Route Handlers
- [ ] pgvector requiere extension habilitada en PostgreSQL
- [ ] RAG necesita embeddings precalculados de documentos

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear prompts de IA (usar templates)
- NO omitir validacion Zod en inputs de usuario
- NO enviar documentos completos a la IA sin chunking
