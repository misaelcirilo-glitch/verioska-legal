interface DatosExpediente {
  nuc: string | null
  carpetaInvestigacion: string | null
  causaPenal: string | null
  delito: string
  juzgado: string | null
  distritoJudicial: string | null
  fiscalia: string | null
  etapaProcesal: string
  imputado: { nombre: string; apellidos: string | null } | null
  victima: { nombre: string; apellidos: string | null } | null
  defensor: { nombre: string; apellidos: string | null } | null
}

export interface EscritoGenerado {
  tipoEscrito: string
  titulo: string
  contenido: string
}

const TIPOS_ESCRITO = {
  solicitud_libertad: 'Solicitud de Libertad por Retención Ilegal',
  solicitud_exclusion_prueba: 'Solicitud de Exclusión de Prueba Ilícita',
  recurso_apelacion: 'Recurso de Apelación',
  solicitud_procedimiento_abreviado: 'Solicitud de Procedimiento Abreviado',
  solicitud_acuerdo_reparatorio: 'Solicitud de Acuerdo Reparatorio',
  amparo_indirecto: 'Demanda de Amparo Indirecto',
  solicitud_sobreseimiento: 'Solicitud de Sobreseimiento',
}

export function getTiposEscrito() {
  return Object.entries(TIPOS_ESCRITO).map(([value, label]) => ({ value, label }))
}

function formatNombre(parte: { nombre: string; apellidos: string | null } | null): string {
  if (!parte) return '[NOMBRE DEL PARTE]'
  return `${parte.nombre} ${parte.apellidos || ''}`.trim()
}

function fechaActual(): string {
  return new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ============================================
// Motor de plantillas propias ({{campo}})
// ============================================

// Construye el diccionario de variables disponibles para sustituir en una
// plantilla del despacho. Las claves son los nombres de {{campo}} soportados.
export function construirVariables(datos: DatosExpediente): Record<string, string> {
  const imputado = formatNombre(datos.imputado)
  const victima = formatNombre(datos.victima)
  const defensor = formatNombre(datos.defensor)
  return {
    imputado,
    cliente: imputado, // alias habitual: el cliente principal suele ser el imputado
    victima,
    defensor,
    juzgado: datos.juzgado || '[JUZGADO]',
    distrito_judicial: datos.distritoJudicial || '[DISTRITO JUDICIAL]',
    fiscalia: datos.fiscalia || '[FISCALÍA]',
    nuc: datos.nuc || datos.carpetaInvestigacion || '[NUC/CI]',
    carpeta_investigacion: datos.carpetaInvestigacion || '[CARPETA DE INVESTIGACIÓN]',
    causa_penal: datos.causaPenal || '[CAUSA PENAL]',
    delito: datos.delito || '[DELITO]',
    etapa_procesal: datos.etapaProcesal || '[ETAPA PROCESAL]',
    fecha: fechaActual(),
  }
}

// Sustituye {{campo}} en el contenido. Insensible a mayúsculas y espacios
// internos ({{ Cliente }} == {{cliente}}). Los campos desconocidos se dejan
// marcados como [CAMPO] para que el usuario los complete a mano.
export function sustituirPlantilla(contenido: string, variables: Record<string, string>): string {
  return contenido.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, campo: string) => {
    const clave = String(campo).toLowerCase()
    if (clave in variables) return variables[clave]
    return `[${String(campo).toUpperCase()}]`
  })
}

export function generarEscrito(tipo: string, datos: DatosExpediente): EscritoGenerado {
  const titulo = TIPOS_ESCRITO[tipo as keyof typeof TIPOS_ESCRITO] || tipo
  const imputado = formatNombre(datos.imputado)
  const defensor = formatNombre(datos.defensor)
  const juzgado = datos.juzgado || '[JUZGADO]'
  const nuc = datos.nuc || datos.carpetaInvestigacion || '[NUC/CI]'
  const causa = datos.causaPenal || '[CAUSA PENAL]'
  const fecha = fechaActual()

  switch (tipo) {
    case 'solicitud_libertad':
      return {
        tipoEscrito: tipo,
        titulo,
        contenido: `${juzgado}
${datos.distritoJudicial || '[DISTRITO JUDICIAL]'}

CAUSA PENAL: ${causa}
NUC: ${nuc}
IMPUTADO: ${imputado}
DELITO: ${datos.delito}

C. JUEZ DE CONTROL:

${defensor}, en mi carácter de defensor particular de ${imputado}, con el debido respeto comparezco para exponer:

Con fundamento en lo dispuesto por los artículos 16 párrafo décimo de la Constitución Política de los Estados Unidos Mexicanos, y 140 y 141 del Código Nacional de Procedimientos Penales, vengo a solicitar la LIBERTAD INMEDIATA de mi representado, en virtud de que ha transcurrido en exceso el plazo constitucional de retención ante el Ministerio Público sin que se haya realizado la puesta a disposición ante autoridad judicial.

HECHOS:

PRIMERO.- Mi representado ${imputado} fue detenido y puesto a disposición del Ministerio Público.

SEGUNDO.- A la fecha, han transcurrido más de 48 horas (o 96 horas en caso de duplicidad de término) sin que el Ministerio Público haya ejercido acción penal ni puesto al detenido a disposición del Juez de Control.

TERCERO.- La retención prolongada e injustificada constituye una violación directa al artículo 16 Constitucional y al artículo 140 del CNPP.

FUNDAMENTO LEGAL:
- Art. 16 CPEUM, párrafo décimo
- Art. 140 CNPP - Plazo de retención
- Art. 141 CNPP - Consecuencias del exceso de plazo

POR LO ANTERIORMENTE EXPUESTO Y FUNDADO:

Solicito a este H. Juzgado se sirva ordenar la LIBERTAD INMEDIATA de ${imputado}, por retención ilegal que excede los plazos constitucionales.

PROTESTO LO NECESARIO.

${datos.distritoJudicial || '[CIUDAD]'}, a ${fecha}.

_________________________________
${defensor}
Defensor Particular
Cédula Profesional: [NÚMERO]`,
      }

    case 'solicitud_exclusion_prueba':
      return {
        tipoEscrito: tipo,
        titulo,
        contenido: `${juzgado}
${datos.distritoJudicial || '[DISTRITO JUDICIAL]'}

CAUSA PENAL: ${causa}
NUC: ${nuc}

C. JUEZ DE CONTROL:

${defensor}, defensor particular de ${imputado}, con fundamento en los artículos 263, 264 y 346 fracción III del Código Nacional de Procedimientos Penales, solicito la EXCLUSIÓN DE PRUEBA ILÍCITA en los siguientes términos:

I. PRUEBA CUYA EXCLUSIÓN SE SOLICITA:
[Describir la prueba específica que se pretende excluir]

II. MOTIVOS DE ILICITUD:
La prueba en cuestión fue obtenida con violación a derechos fundamentales, en contravención a lo establecido por el artículo 264 del CNPP, que establece que los datos y pruebas obtenidos con violación a derechos fundamentales serán nulos.

[Describir la violación específica]

III. FUNDAMENTO LEGAL:
- Art. 264 CNPP - Nulidad de prueba ilícita
- Art. 263 CNPP - Licitud de prueba
- Art. 346 fracción III CNPP - Exclusión en etapa intermedia

POR LO EXPUESTO:
Solicito se declare la exclusión de la prueba señalada por haber sido obtenida de manera ilícita.

${datos.distritoJudicial || '[CIUDAD]'}, a ${fecha}.

_________________________________
${defensor}
Defensor Particular`,
      }

    case 'solicitud_sobreseimiento':
      return {
        tipoEscrito: tipo,
        titulo,
        contenido: `${juzgado}
${datos.distritoJudicial || '[DISTRITO JUDICIAL]'}

CAUSA PENAL: ${causa}
NUC: ${nuc}
IMPUTADO: ${imputado}
DELITO: ${datos.delito}

C. JUEZ DE CONTROL:

${defensor}, defensor particular de ${imputado}, con fundamento en el artículo 327 del Código Nacional de Procedimientos Penales, solicito el SOBRESEIMIENTO de la presente causa penal, por las siguientes razones:

I. HECHOS:
[Describir los hechos que fundamentan el sobreseimiento]

II. CAUSA DE SOBRESEIMIENTO (Art. 327 CNPP):
[Seleccionar la causa aplicable:]
- El Ministerio Público no formuló acusación dentro del plazo legal (Art. 327 fracción I)
- Se demuestra la inexistencia del hecho materia del proceso (Art. 327 fracción II)
- El hecho no constituye delito (Art. 327 fracción III)
- Apareció claramente la inocencia del imputado (Art. 327 fracción IV)
- Agotada la investigación, el MP estimó que no cuenta con elementos para fundar una acusación (Art. 327 fracción V)
- Se extinguió la acción penal (Art. 327 fracción VI)

III. FUNDAMENTO LEGAL:
- Art. 327 CNPP - Causas de sobreseimiento
- Art. 328 CNPP - Efectos del sobreseimiento

POR LO EXPUESTO:
Solicito se decrete el SOBRESEIMIENTO de la presente causa penal.

${datos.distritoJudicial || '[CIUDAD]'}, a ${fecha}.

_________________________________
${defensor}
Defensor Particular`,
      }

    default:
      return {
        tipoEscrito: tipo,
        titulo,
        contenido: `${juzgado}
${datos.distritoJudicial || '[DISTRITO JUDICIAL]'}

CAUSA PENAL: ${causa}
NUC: ${nuc}
IMPUTADO: ${imputado}
DELITO: ${datos.delito}

C. JUEZ:

${defensor}, en mi carácter de defensor particular de ${imputado}, con el debido respeto comparezco para:

[CONTENIDO DEL ESCRITO]

FUNDAMENTO LEGAL:
[ARTÍCULOS APLICABLES]

POR LO EXPUESTO:
[PETICIÓN]

${datos.distritoJudicial || '[CIUDAD]'}, a ${fecha}.

_________________________________
${defensor}
Defensor Particular`,
      }
  }
}
