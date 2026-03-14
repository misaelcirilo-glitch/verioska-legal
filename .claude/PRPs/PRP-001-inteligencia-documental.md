# PRP-001: Inteligencia Documental

> **Estado**: COMPLETADO
> **Fecha**: 2026-03-08
> **Proyecto**: Verioska - Centro de Mando Procesal Penal

---

## Objetivo

Permitir a abogados subir documentos de la carpeta de investigacion (fotos de actuaciones, PDFs, audios), organizarlos por etapa procesal, extraer entidades legales automaticamente y generar una cronologia procesal interactiva.

## Por Que

| Problema | Solucion |
|----------|----------|
| Abogados pierden horas organizando evidencia fisica manualmente | Upload digital con clasificacion automatica por etapa |
| No pueden buscar datos dentro de documentos escaneados | OCR + extraccion de entidades (nombres, fechas, delitos) |
| La cronologia del caso se arma manualmente en papel | Linea del tiempo automatica basada en documentos y hechos |

**Valor de negocio**: Ahorro de 2+ horas diarias por abogado en organizacion de evidencias. Analisis de expediente completo en menos de 5 minutos.

## Que

### Criterios de Exito
- [x] Upload de archivos (PDF, imagen, audio) con metadata y etapa procesal
- [x] Vista de documentos por expediente con filtro por etapa y tipo
- [x] OCR de imagenes/PDFs con extraccion de texto
- [x] Extraccion automatica de entidades: nombres, fechas, delitos, juzgados, articulos
- [x] Cronologia procesal interactiva generada desde documentos + hechos + audiencias + plazos
- [x] Almacenamiento local de archivos (filesystem, migrar a S3/R2 en produccion)

### Comportamiento Esperado (Happy Path)
1. Abogado abre expediente > seccion "Documentos" > click "Subir documento"
2. Selecciona archivo (foto/PDF) + tipo de documento + etapa procesal
3. Sistema guarda archivo, muestra preview/thumbnail
4. Abogado hace click "Procesar" > OCR extrae texto > entidades se detectan automaticamente
5. Hechos extraidos aparecen en la cronologia del expediente
6. Cronologia muestra timeline visual: hechos + audiencias + plazos en orden cronologico

---

## Contexto

### Referencias
- `src/app/api/expedientes/[id]/` - Patron de API routes existente
- `src/app/(main)/expedientes/[id]/page.tsx` - Pagina detalle a extender
- `schema.sql` - Tablas `documentos`, `hechos`, `cronologia` ya definidas en BD
- `BUSINESS_LOGIC.md` - Fase 2 spec

### Arquitectura Propuesta (Feature-First)
```
src/features/
  documentos/
    components/     # UploadForm, DocumentoCard, DocumentosList
    services/       # upload, ocr, extraccion
    types/          # Documento, Hecho, EntidadExtraida
  cronologia/
    components/     # TimelineView, EventoCard
    types/          # EventoCronologia
```

### Modelo de Datos
Tablas `documentos`, `hechos`, `cronologia` ya existen en PostgreSQL (Docker local).
No se requieren migraciones de esquema.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo FASES. Subtareas se generan al entrar a cada fase (Just-In-Time).

### Fase 1: Upload y almacenamiento de documentos
**Objetivo**: Subir archivos al servidor, guardar metadata en BD, mostrar lista de documentos por expediente
**Validacion**: Poder subir un PDF/imagen desde la UI, verlo listado en el expediente

### Fase 2: OCR y extraccion de texto
**Objetivo**: Procesar imagenes/PDFs con OCR, guardar texto extraido en BD
**Validacion**: Subir foto de actuacion > ver texto extraido en el documento

### Fase 3: Extraccion de entidades legales
**Objetivo**: Detectar automaticamente nombres, fechas, delitos, articulos del texto extraido. Crear hechos en BD.
**Validacion**: Documento procesado > hechos aparecen automaticamente vinculados al expediente

### Fase 4: Cronologia procesal interactiva
**Objetivo**: Vista timeline que combina hechos + audiencias + plazos en orden cronologico
**Validacion**: Pagina de cronologia muestra eventos de todas las fuentes ordenados

### Fase 5: Validacion Final
**Objetivo**: Sistema funcionando end-to-end
**Validacion**:
- [x] Upload funciona para PDF, imagen
- [x] OCR extrae texto legible
- [x] Entidades se detectan correctamente
- [x] Cronologia muestra todos los eventos
- [x] `npm run build` exitoso

---

## Aprendizajes (Self-Annealing)

> Esta seccion CRECE con cada error encontrado durante la implementacion.

### 2026-03-08: Tesseract.js requiere serverExternalPackages
- **Error**: Next.js Turbopack intenta bundlear worker threads de Tesseract.js, falla en build
- **Fix**: Agregar `serverExternalPackages: ['tesseract.js', 'tesseract.js-core']` en `next.config.ts`
- **Aplicar en**: Cualquier librería que use worker threads nativos en Next.js

### 2026-03-08: Lucide-react no acepta `title` como prop
- **Error**: `Property 'title' does not exist` en componentes lucide-react
- **Fix**: Envolver el icono en `<span title="...">` en lugar de pasar title directamente
- **Aplicar en**: Todos los componentes que usen iconos lucide-react

### 2026-03-08: Record<string, unknown> no es ReactNode
- **Error**: `Type 'unknown' is not assignable to type 'ReactNode'` al renderizar metadata
- **Fix**: Usar `typeof valor === 'string'` en lugar de truthiness check para narrowing
- **Aplicar en**: Renderizado de valores de objetos con tipos unknown

---

## Gotchas

- [ ] File upload en Next.js 16 App Router usa Route Handlers con formData
- [ ] OCR requiere libreria externa (Tesseract.js para local, o API como Google Vision)
- [ ] Archivos grandes necesitan streaming upload
- [ ] Almacenamiento local en `public/uploads/` para dev, S3/R2 para produccion

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear rutas de archivos
- NO omitir validacion Zod en inputs de usuario
- NO procesar OCR en el request principal (usar async/background)
