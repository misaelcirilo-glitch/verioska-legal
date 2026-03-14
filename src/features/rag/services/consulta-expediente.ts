import { query } from '@/lib/db'

interface DocumentoConTexto {
  id: string
  nombreArchivo: string
  tipoDocumento: string | null
  textoExtraido: string
}

interface ResultadoBusqueda {
  documentoId: string
  nombreArchivo: string
  tipoDocumento: string | null
  fragmento: string
  relevancia: number
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buscarEnTexto(texto: string, consulta: string): { encontrado: boolean; fragmento: string; relevancia: number } {
  const textoNorm = normalizarTexto(texto)
  const palabras = normalizarTexto(consulta).split(' ').filter(p => p.length > 2)

  if (palabras.length === 0) return { encontrado: false, fragmento: '', relevancia: 0 }

  let totalCoincidencias = 0
  let mejorPosicion = -1

  for (const palabra of palabras) {
    const idx = textoNorm.indexOf(palabra)
    if (idx !== -1) {
      totalCoincidencias++
      if (mejorPosicion === -1 || idx < mejorPosicion) {
        mejorPosicion = idx
      }
    }
  }

  if (totalCoincidencias === 0) return { encontrado: false, fragmento: '', relevancia: 0 }

  // Extraer fragmento alrededor de la mejor coincidencia
  const start = Math.max(0, mejorPosicion - 100)
  const end = Math.min(texto.length, mejorPosicion + 300)
  const fragmento = (start > 0 ? '...' : '') + texto.slice(start, end).trim() + (end < texto.length ? '...' : '')

  return {
    encontrado: true,
    fragmento,
    relevancia: totalCoincidencias / palabras.length,
  }
}

export async function buscarEnExpediente(
  expedienteId: string,
  consulta: string
): Promise<ResultadoBusqueda[]> {
  // Buscar en documentos procesados
  const documentos = await query<{
    id: string; nombre_archivo: string; tipo_documento: string | null
    texto_extraido: string
  }>(
    `SELECT id, nombre_archivo, tipo_documento, texto_extraido
     FROM documentos
     WHERE expediente_id = $1 AND procesado = TRUE AND texto_extraido IS NOT NULL`,
    [expedienteId]
  )

  // Buscar en declaraciones
  const declaraciones = await query<{
    id: string; contenido: string; tipo: string
  }>(
    'SELECT id, contenido, tipo FROM declaraciones WHERE expediente_id = $1',
    [expedienteId]
  )

  // Buscar en hechos
  const hechos = await query<{
    id: string; descripcion: string
  }>(
    'SELECT id, descripcion FROM hechos WHERE expediente_id = $1',
    [expedienteId]
  )

  const resultados: ResultadoBusqueda[] = []

  // Buscar en documentos
  for (const doc of documentos) {
    const { encontrado, fragmento, relevancia } = buscarEnTexto(doc.texto_extraido, consulta)
    if (encontrado) {
      resultados.push({
        documentoId: doc.id,
        nombreArchivo: doc.nombre_archivo,
        tipoDocumento: doc.tipo_documento,
        fragmento,
        relevancia,
      })
    }
  }

  // Buscar en declaraciones
  for (const decl of declaraciones) {
    const { encontrado, fragmento, relevancia } = buscarEnTexto(decl.contenido, consulta)
    if (encontrado) {
      resultados.push({
        documentoId: decl.id,
        nombreArchivo: `Declaración ${decl.tipo}`,
        tipoDocumento: 'declaracion',
        fragmento,
        relevancia,
      })
    }
  }

  // Buscar en hechos
  for (const hecho of hechos) {
    const { encontrado, fragmento, relevancia } = buscarEnTexto(hecho.descripcion, consulta)
    if (encontrado) {
      resultados.push({
        documentoId: hecho.id,
        nombreArchivo: 'Hecho extraído',
        tipoDocumento: 'hecho',
        fragmento,
        relevancia,
      })
    }
  }

  // Ordenar por relevancia
  return resultados.sort((a, b) => b.relevancia - a.relevancia).slice(0, 10)
}

export function construirContextoParaIA(resultados: ResultadoBusqueda[]): string {
  if (resultados.length === 0) return ''

  return resultados
    .map((r, i) => `[Fuente ${i + 1}: ${r.nombreArchivo}]\n${r.fragmento}`)
    .join('\n\n---\n\n')
}
