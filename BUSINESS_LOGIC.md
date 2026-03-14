# BUSINESS_LOGIC.md - Verioska: Centro de Mando Procesal Penal

> Generado por SaaS Factory | Fecha: 2026-03-07

## 1. Problema de Negocio

**Dolor:** El proceso roto es el control de terminos procesales y el seguimiento de la Carpeta de Investigacion. Los abogados penalistas litigantes sufren porque la fiscalia no les notifica todo a tiempo y dependen de una agenda fisica o un Excel manual. Lo parchan con alarmas en el celular y pegando post-its en expedientes de papel. Si se les pasa un plazo de 24 o 48 horas (como una duplicidad de termino), el cliente se queda en prision.

**Costo actual:**
- Libertad de personas: un error de un dia en un plazo de amparo o apelacion significa perder el caso antes de empezar
- Economico: un despacho puede perder contratos de cientos de miles de pesos por mala gestion de una audiencia inicial
- Tiempo: horas diarias organizando evidencias manualmente
- Reputacion: un plazo vencido destruye la confianza del cliente

## 2. Solucion

**Nombre:** Verioska

**Propuesta de valor:** Un centro de mando procesal que automatiza el conteo de plazos y la gestion de evidencias para abogados defensores penalistas en Mexico.

**Verioska NO es un chatbot. Es un centro de mando con 4 motores:**

| Motor | Funcion |
|-------|---------|
| Motor de Plazos | Calcula automaticamente 48h (MP), 72h/144h (vinculacion), amparo, apelacion segun CNPP |
| RAG Juridico | Procesa documentos de carpeta y permite consultas contra el expediente |
| Extractor de Entidades | Saca nombres, fechas, delitos, juzgados de fotos/PDFs |
| Analizador de Declaraciones | Compara declaraciones y detecta contradicciones |

**Flujo principal (Happy Path):**
1. El abogado registra un nuevo caso con numero de carpeta (NUC/CI) y fecha de detencion
2. El sistema calcula automaticamente el reloj de 48h (MP) y 72h/144h (vinculacion) y lanza alertas visuales rojas
3. El abogado/pasante sube fotos de las actuaciones de la fiscalia y el sistema las organiza por etapa (Inicial, Intermedia, Juicio)
4. El abogado llega a la audiencia con un dashboard claro de que pruebas faltan y cuando vence su proximo plazo legal

## 3. Usuario Objetivo

**Rol principal:** Abogado litigante particular (el que esta en la calle y en los juzgados)
**Rol secundario:** Pasante de confianza (alimenta el sistema con datos de juzgados)
**Perfil del despacho:**
- 2-10 abogados
- Litigacion constante en materia penal
- Alto volumen de expedientes simultaneos
- Poco soporte tecnologico actual
- Ubicacion: Mexico (sistema penal acusatorio, CNPP)

## 4. Arquitectura de Datos

**Input:**
- Numero de carpeta de investigacion (NUC/CI)
- Nombres de imputados y victimas
- Delitos imputados
- Fechas de audiencias y detencion
- Fotos de documentos legales (actuaciones de fiscalia)
- Grabaciones de audio de audiencias
- Declaraciones ministeriales y judiciales
- Informes policiales y peritajes
- Acuerdos del juez

**Output:**
- Calendario sincronizado de audiencias
- Alertas de "Plazo por Vencer" via Email y WhatsApp
- Reporte ejecutivo de la etapa actual de cada caso
- Cronologia procesal interactiva
- Contradicciones testimoniales detectadas
- Mapa probatorio (que prueba soporta que hecho)
- Resumen estrategico con fundamento legal
- Dashboard con semaforo de urgencia (rojo/amarillo/verde)

**Storage (PostgreSQL independiente):**
- `users` — Abogados y pasantes registrados
- `despachos` — Firmas/despachos legales
- `expedientes` — Casos con NUC, fecha detencion, delito, etapa
- `partes` — Imputados, victimas, MP, testigos, peritos, juez
- `documentos` — Archivos cargados (PDFs, fotos, audios) con metadata
- `hechos` — Hechos extraidos de documentos
- `declaraciones` — Declaraciones con referencia a documento fuente
- `cronologia` — Eventos para linea del tiempo
- `contradicciones` — Inconsistencias entre declaraciones
- `plazos` — Plazos procesales con fecha limite, estado y alerta
- `audiencias` — Audiencias programadas y realizadas
- `estrategias` — Sugerencias de estrategia generadas por IA
- `escritos` — Documentos legales generados
- `embeddings` — Vectores para RAG juridico (pgvector)

## 5. KPI de Exito (V1)

- Reduccion del 100% en errores de plazos legales
- Ahorro de 2 horas diarias en organizacion de evidencias por abogado
- Analisis de expediente completo en menos de 5 minutos
- Generacion de cronologia probatoria automatica

## 6. Especificacion Tecnica

### Fases de Implementacion

**FASE 1 - MVP (lo que salva casos)**
```
src/features/
  auth/              # Login abogado + pasante
  expedientes/       # CRUD con NUC, fecha detencion, delito
  plazos/            # Motor CNPP automatico + semaforo
  audiencias/        # Calendario + registro
  dashboard/         # Vista general con alertas rojas
```

**FASE 2 - Inteligencia documental**
```
src/features/
  documentos/        # Upload fotos/PDFs de actuaciones
  extraccion/        # OCR + extractor de entidades legales
  cronologia/        # Linea del tiempo automatica
```

**FASE 3 - IA Defensiva**
```
src/features/
  contradicciones/   # Analizador de declaraciones
  estrategia/        # Sugerencias con fundamento CNPP
  escritos/          # Generacion de promociones
  rag/               # Consultas contra expediente completo
```

### Stack Confirmado

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4
- **Backend:** API Routes de Next.js
- **Base de Datos:** PostgreSQL independiente (NO Supabase)
- **IA/RAG:** Vercel AI SDK v5 + OpenRouter + pgvector
- **Auth:** NextAuth.js o JWT custom
- **Alertas:** Email (Resend) + WhatsApp Business API
- **Almacenamiento:** S3 o Cloudflare R2 para archivos
- **Validacion:** Zod
- **Estado:** Zustand
- **MCPs:** Next.js DevTools + Playwright

### Proximos Pasos

**Fase 1 - MVP**
1. [ ] Configurar PostgreSQL y ejecutar schema SQL
2. [ ] Implementar Auth (registro/login abogado + pasante)
3. [ ] Feature: expedientes (CRUD con NUC, detencion, delito)
4. [ ] Feature: plazos (motor CNPP automatico + semaforo + alertas)
5. [ ] Feature: audiencias (calendario y registro)
6. [ ] Feature: dashboard (vista general con semaforo rojo/amarillo/verde)
7. [ ] Testing E2E

**Fase 2 - Inteligencia documental**
8. [ ] Feature: documentos (upload y organizacion por etapa)
9. [ ] Feature: extraccion (OCR + entidades legales)
10. [ ] Feature: cronologia (linea del tiempo automatica)

**Fase 3 - IA Defensiva**
11. [ ] Feature: contradicciones (analisis de declaraciones)
12. [ ] Feature: estrategia (sugerencias con fundamento CNPP)
13. [ ] Feature: escritos (generacion de promociones)
14. [ ] Feature: RAG juridico (consultas contra expediente)
15. [ ] Deploy produccion
