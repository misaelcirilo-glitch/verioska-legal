import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { buscarEnExpediente, construirContextoParaIA } from '@/features/rag/services/consulta-expediente'
import { buscarJurisprudencia } from '@/features/jurisprudencia/services/catalogo-jurisprudencia'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{
    id: string; pais: string; delito: string; etapa_procesal: string
    nuc: string; causa_penal: string
  }>(
    `SELECT e.id, e.pais, e.delito, e.etapa_procesal, e.nuc, e.causa_penal
     FROM expedientes e WHERE e.id = $1 AND e.user_id = $2`,
    [expedienteId, userId]
  )
}

// GET: obtener historial de mensajes del cerebro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const expediente = await verifyOwnership(id, session.userId)
    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const mensajes = await query(
      `SELECT id, rol, contenido, fuentes, created_at
       FROM cerebro_mensajes
       WHERE expediente_id = $1 AND user_id = $2
       ORDER BY created_at ASC
       LIMIT 50`,
      [id, session.userId]
    )

    return NextResponse.json({ data: { mensajes } })
  } catch (error) {
    console.error('GET cerebro error:', error)
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 })
  }
}

// POST: enviar mensaje al cerebro
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const expediente = await verifyOwnership(id, session.userId)
    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const { mensaje } = await request.json()
    if (!mensaje || typeof mensaje !== 'string' || mensaje.length < 2) {
      return NextResponse.json({ error: 'Mensaje demasiado corto' }, { status: 400 })
    }

    const pais = (expediente.pais || 'MX') as 'MX' | 'PE'
    const codigoProcesal = pais === 'PE' ? 'NCPP' : 'CNPP'

    // 1. Guardar mensaje del usuario
    await queryOne(
      `INSERT INTO cerebro_mensajes (expediente_id, user_id, rol, contenido)
       VALUES ($1, $2, 'user', $3) RETURNING id`,
      [id, session.userId, mensaje]
    )

    // 2. Recopilar contexto completo del expediente
    // Buscar en documentos/declaraciones/hechos
    const resultadosRAG = await buscarEnExpediente(id, mensaje)
    const contextoDocumental = construirContextoParaIA(resultadosRAG)

    // Buscar jurisprudencia relevante
    const jurisprudenciaRelevante = buscarJurisprudencia({
      consulta: mensaje,
      pais,
      etapa: expediente.etapa_procesal || undefined,
    }).slice(0, 3)

    const contextoJurisprudencia = jurisprudenciaRelevante.length > 0
      ? '\n\nJURISPRUDENCIA RELEVANTE:\n' + jurisprudenciaRelevante.map(j =>
        `- ${j.numeroTesis} (${j.organo}): ${j.rubro}\n  ${j.texto.slice(0, 200)}...`
      ).join('\n')
      : ''

    // Obtener estrategias existentes
    const estrategias = await query<{ titulo: string; tipo: string; descripcion: string }>(
      'SELECT titulo, tipo, descripcion FROM estrategias WHERE expediente_id = $1 ORDER BY confianza DESC LIMIT 5',
      [id]
    )
    const contextoEstrategias = estrategias.length > 0
      ? '\n\nESTRATEGIAS ACTIVAS:\n' + estrategias.map(e => `- [${e.tipo}] ${e.titulo}: ${e.descripcion.slice(0, 100)}`).join('\n')
      : ''

    // Obtener contradicciones
    const contradicciones = await query<{ tema: string; severidad: string; descripcion: string }>(
      "SELECT tema, severidad, descripcion FROM contradicciones WHERE expediente_id = $1 AND (severidad = 'critica' OR severidad = 'alta') LIMIT 5",
      [id]
    )
    const contextoContradicciones = contradicciones.length > 0
      ? '\n\nCONTRADICCIONES DETECTADAS:\n' + contradicciones.map(c => `- [${c.severidad}] ${c.tema}: ${c.descripcion.slice(0, 150)}`).join('\n')
      : ''

    // Obtener plazos urgentes
    const plazos = await query<{ nombre: string; fecha_limite: string; estado: string }>(
      "SELECT nombre, fecha_limite, estado FROM plazos WHERE expediente_id = $1 AND estado IN ('activo', 'urgente', 'vencido') ORDER BY fecha_limite ASC LIMIT 5",
      [id]
    )
    const contextoPlazos = plazos.length > 0
      ? '\n\nPLAZOS ACTIVOS:\n' + plazos.map(p => `- ${p.nombre}: ${p.fecha_limite} (${p.estado})`).join('\n')
      : ''

    // Obtener historial reciente
    const historial = await query<{ rol: string; contenido: string }>(
      `SELECT rol, contenido FROM cerebro_mensajes
       WHERE expediente_id = $1 AND user_id = $2
       ORDER BY created_at DESC LIMIT 10`,
      [id, session.userId]
    )
    const contextoHistorial = historial.length > 1
      ? '\n\nHISTORIAL RECIENTE:\n' + historial.reverse().slice(0, -1).map(m =>
        `${m.rol === 'user' ? 'Abogado' : 'Verioska'}: ${m.contenido.slice(0, 200)}`
      ).join('\n')
      : ''

    // 3. Construir prompt completo
    const systemPrompt = `Eres Verioska, un asistente de inteligencia artificial especializado en defensa penal para ${pais === 'PE' ? 'Perú (NCPP - Nuevo Código Procesal Penal)' : 'México (CNPP - Código Nacional de Procedimientos Penales)'}.

DATOS DEL EXPEDIENTE:
- Delito: ${expediente.delito || 'No especificado'}
- Etapa procesal: ${expediente.etapa_procesal || 'No especificada'}
- ${pais === 'MX' ? `NUC: ${expediente.nuc || 'N/A'}` : `Causa: ${expediente.causa_penal || 'N/A'}`}
- País: ${pais}
- Código procesal: ${codigoProcesal}

INSTRUCCIONES:
1. Responde SIEMPRE desde la perspectiva de la DEFENSA.
2. Cita artículos del ${codigoProcesal} cuando sea pertinente.
3. Si hay jurisprudencia relevante, cítala con su número de tesis/casación.
4. Basa tus respuestas en el contexto del expediente cuando esté disponible.
5. Si no tienes información suficiente, indícalo claramente.
6. Sé práctico: da recomendaciones accionables, no solo teoría.
7. Si detectas riesgos para la defensa (plazos por vencer, contradicciones sin explotar), alerta proactivamente.
8. Responde en español.`

    const contextoCompleto = [
      contextoDocumental ? `DOCUMENTOS DEL EXPEDIENTE:\n${contextoDocumental}` : '',
      contextoEstrategias,
      contextoContradicciones,
      contextoPlazos,
      contextoJurisprudencia,
      contextoHistorial,
    ].filter(Boolean).join('\n')

    const userPrompt = contextoCompleto
      ? `${contextoCompleto}\n\n---\n\nPREGUNTA DEL ABOGADO: ${mensaje}`
      : `PREGUNTA DEL ABOGADO: ${mensaje}`

    // 4. Llamar a IA
    let respuesta: string
    const fuentesUsadas: { tipo: string; nombre: string }[] = []

    const apiKey = process.env.OPENROUTER_API_KEY
    if (apiKey) {
      try {
        const { generateText } = await import('ai')
        const { createOpenAI } = await import('@ai-sdk/openai')

        const openrouter = createOpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey,
        })

        const { text } = await generateText({
          model: openrouter('google/gemini-2.0-flash-001'),
          system: systemPrompt,
          prompt: userPrompt,
        })

        respuesta = text

        // Registrar fuentes usadas
        if (resultadosRAG.length > 0) {
          resultadosRAG.slice(0, 3).forEach(r => fuentesUsadas.push({
            tipo: r.tipoDocumento || 'documento',
            nombre: r.nombreArchivo,
          }))
        }
        if (jurisprudenciaRelevante.length > 0) {
          jurisprudenciaRelevante.forEach(j => fuentesUsadas.push({
            tipo: 'jurisprudencia',
            nombre: j.numeroTesis,
          }))
        }
      } catch (aiError) {
        console.error('Error con IA:', aiError)
        respuesta = generarRespuestaFallback(mensaje, expediente, pais, contradicciones, plazos, estrategias)
      }
    } else {
      respuesta = generarRespuestaFallback(mensaje, expediente, pais, contradicciones, plazos, estrategias)
    }

    // 5. Guardar respuesta del asistente
    await queryOne(
      `INSERT INTO cerebro_mensajes (expediente_id, user_id, rol, contenido, fuentes)
       VALUES ($1, $2, 'assistant', $3, $4) RETURNING id`,
      [id, session.userId, respuesta, JSON.stringify(fuentesUsadas)]
    )

    return NextResponse.json({
      data: {
        respuesta,
        fuentes: fuentesUsadas,
        usandoIA: !!apiKey,
      },
    })
  } catch (error) {
    console.error('POST cerebro error:', error)
    return NextResponse.json({ error: 'Error al procesar mensaje' }, { status: 500 })
  }
}

// Respuesta inteligente sin IA externa
function generarRespuestaFallback(
  mensaje: string,
  expediente: { delito: string; etapa_procesal: string; pais: string },
  pais: 'MX' | 'PE',
  contradicciones: { tema: string; severidad: string }[],
  plazos: { nombre: string; fecha_limite: string; estado: string }[],
  estrategias: { titulo: string; tipo: string }[],
): string {
  const partes: string[] = []
  const codigoProcesal = pais === 'PE' ? 'NCPP' : 'CNPP'

  partes.push(`**Análisis del expediente** (${expediente.delito || 'delito no especificado'} - Etapa: ${expediente.etapa_procesal || 'no definida'})\n`)

  if (plazos.length > 0) {
    const urgentes = plazos.filter(p => p.estado === 'urgente' || p.estado === 'vencido')
    if (urgentes.length > 0) {
      partes.push(`**ALERTA - Plazos críticos:**`)
      urgentes.forEach(p => partes.push(`- ${p.nombre}: ${p.fecha_limite} (${p.estado.toUpperCase()})`))
      partes.push('')
    }
  }

  if (contradicciones.length > 0) {
    partes.push(`**Contradicciones detectadas (${contradicciones.length}):**`)
    contradicciones.forEach(c => partes.push(`- [${c.severidad}] ${c.tema}`))
    partes.push(`\nRecomendación: Utilizar estas contradicciones en contrainterrogatorio conforme al ${pais === 'PE' ? 'Art. 378.8 NCPP' : 'Art. 373 CNPP'}.\n`)
  }

  if (estrategias.length > 0) {
    partes.push(`**Estrategias activas (${estrategias.length}):**`)
    estrategias.slice(0, 3).forEach(e => partes.push(`- [${e.tipo}] ${e.titulo}`))
    partes.push('')
  }

  partes.push(`Para una respuesta más detallada con IA, configura la variable OPENROUTER_API_KEY en tu archivo .env.local.`)

  return partes.join('\n')
}
