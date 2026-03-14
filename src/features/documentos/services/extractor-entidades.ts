export interface EntidadExtraida {
  tipo: 'fecha' | 'persona' | 'delito' | 'articulo' | 'juzgado' | 'lugar'
  valor: string
  contexto: string
}

export interface HechoExtraido {
  descripcion: string
  fecha: string | null
  lugar: string | null
  relevancia: 'critica' | 'alta' | 'media' | 'baja'
}

// Patrones para fechas en documentos legales mexicanos
const FECHA_PATTERNS = [
  // "15 de marzo de 2026", "3 de enero del 2025"
  /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:del?\s+)?(\d{4})/gi,
  // "15/03/2026", "03-01-2025"
  /(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/g,
]

const MESES: Record<string, string> = {
  enero: '01', febrero: '02', marzo: '03', abril: '04',
  mayo: '05', junio: '06', julio: '07', agosto: '08',
  septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
}

// Artículos legales: "Art. 16 CPEUM", "artículo 313 del CNPP", "fracción II"
const ARTICULO_PATTERN = /(?:art[íi]culo|art\.?)\s+(\d+(?:\s+(?:bis|ter|qu[aá]ter))?)\s+(?:del?\s+)?([A-ZÁÉÍÓÚ]{2,}(?:\s+[A-ZÁÉÍÓÚ]{2,})?)/gi

// Delitos comunes en derecho penal mexicano
const DELITOS = [
  'homicidio', 'robo', 'violación', 'secuestro', 'extorsión',
  'fraude', 'abuso de confianza', 'lesiones', 'amenazas',
  'portación de arma', 'posesión de narcóticos', 'tráfico de drogas',
  'delincuencia organizada', 'lavado de dinero', 'cohecho',
  'peculado', 'abuso de autoridad', 'feminicidio', 'trata de personas',
  'despojo', 'daño en propiedad', 'violencia familiar', 'narcomenudeo',
  'robo con violencia', 'robo a casa habitación', 'robo de vehículo',
]

// Juzgados y tribunales
const JUZGADO_PATTERN = /(?:juzgado|tribunal|sala)\s+(?:de\s+)?(?:\w+\s+){0,4}(?:penal|control|enjuiciamiento|distrito|circuito)/gi

function getContexto(texto: string, match: RegExpMatchArray, chars: number = 80): string {
  const start = Math.max(0, (match.index || 0) - chars)
  const end = Math.min(texto.length, (match.index || 0) + match[0].length + chars)
  return texto.slice(start, end).replace(/\s+/g, ' ').trim()
}

export function extraerEntidades(texto: string): EntidadExtraida[] {
  const entidades: EntidadExtraida[] = []
  const seen = new Set<string>()

  // Extraer fechas
  for (const pattern of FECHA_PATTERNS) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(texto)) !== null) {
      const key = `fecha:${match[0]}`
      if (!seen.has(key)) {
        seen.add(key)
        entidades.push({
          tipo: 'fecha',
          valor: match[0],
          contexto: getContexto(texto, match),
        })
      }
    }
  }

  // Extraer artículos legales
  ARTICULO_PATTERN.lastIndex = 0
  let artMatch: RegExpExecArray | null
  while ((artMatch = ARTICULO_PATTERN.exec(texto)) !== null) {
    const key = `articulo:${artMatch[0]}`
    if (!seen.has(key)) {
      seen.add(key)
      entidades.push({
        tipo: 'articulo',
        valor: artMatch[0].trim(),
        contexto: getContexto(texto, artMatch),
      })
    }
  }

  // Extraer delitos mencionados
  const textoLower = texto.toLowerCase()
  for (const delito of DELITOS) {
    const idx = textoLower.indexOf(delito)
    if (idx !== -1) {
      const key = `delito:${delito}`
      if (!seen.has(key)) {
        seen.add(key)
        const start = Math.max(0, idx - 80)
        const end = Math.min(texto.length, idx + delito.length + 80)
        entidades.push({
          tipo: 'delito',
          valor: delito,
          contexto: texto.slice(start, end).replace(/\s+/g, ' ').trim(),
        })
      }
    }
  }

  // Extraer juzgados
  JUZGADO_PATTERN.lastIndex = 0
  let juzMatch: RegExpExecArray | null
  while ((juzMatch = JUZGADO_PATTERN.exec(texto)) !== null) {
    const key = `juzgado:${juzMatch[0].toLowerCase()}`
    if (!seen.has(key)) {
      seen.add(key)
      entidades.push({
        tipo: 'juzgado',
        valor: juzMatch[0].trim(),
        contexto: getContexto(texto, juzMatch),
      })
    }
  }

  return entidades
}

export function generarHechos(texto: string, entidades: EntidadExtraida[]): HechoExtraido[] {
  const hechos: HechoExtraido[] = []

  // Generar hechos a partir de delitos encontrados
  const delitos = entidades.filter(e => e.tipo === 'delito')
  const fechas = entidades.filter(e => e.tipo === 'fecha')
  const primeraFecha = fechas.length > 0 ? normalizarFecha(fechas[0].valor) : null

  for (const delito of delitos) {
    hechos.push({
      descripcion: `Delito identificado: ${delito.valor}. Contexto: "${delito.contexto}"`,
      fecha: primeraFecha,
      lugar: null,
      relevancia: 'alta',
    })
  }

  // Generar hechos a partir de artículos legales
  const articulos = entidades.filter(e => e.tipo === 'articulo')
  for (const art of articulos) {
    hechos.push({
      descripcion: `Fundamento legal citado: ${art.valor}. Contexto: "${art.contexto}"`,
      fecha: null,
      lugar: null,
      relevancia: 'media',
    })
  }

  // Si hay texto sustancial y no se encontraron delitos, crear un hecho general
  if (hechos.length === 0 && texto.length > 100) {
    const resumen = texto.slice(0, 300).replace(/\s+/g, ' ').trim()
    hechos.push({
      descripcion: `Contenido del documento: "${resumen}..."`,
      fecha: primeraFecha,
      lugar: null,
      relevancia: 'media',
    })
  }

  return hechos
}

function normalizarFecha(fechaStr: string): string | null {
  // Intentar formato "15 de marzo de 2026"
  const textoMatch = fechaStr.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:del?\s+)?(\d{4})/i
  )
  if (textoMatch) {
    const dia = textoMatch[1].padStart(2, '0')
    const mes = MESES[textoMatch[2].toLowerCase()]
    const anio = textoMatch[3]
    return `${anio}-${mes}-${dia}T00:00:00.000Z`
  }

  // Intentar formato numérico
  const numMatch = fechaStr.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/)
  if (numMatch) {
    const dia = numMatch[1].padStart(2, '0')
    const mes = numMatch[2].padStart(2, '0')
    const anio = numMatch[3]
    return `${anio}-${mes}-${dia}T00:00:00.000Z`
  }

  return null
}
