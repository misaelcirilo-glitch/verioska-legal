import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { buscarEnExpediente, construirContextoParaIA } from '@/features/rag/services/consulta-expediente'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    'SELECT id FROM expedientes WHERE id = $1 AND user_id = $2',
    [expedienteId, userId]
  )
}

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
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const { consulta } = await request.json()
    if (!consulta || typeof consulta !== 'string' || consulta.length < 3) {
      return NextResponse.json({ error: 'Consulta demasiado corta' }, { status: 400 })
    }

    // Buscar en todos los documentos del expediente
    const resultados = await buscarEnExpediente(id, consulta)

    if (resultados.length === 0) {
      return NextResponse.json({
        data: {
          respuesta: 'No se encontraron resultados relevantes en el expediente para esta consulta. Asegúrate de haber subido y procesado documentos.',
          fuentes: [],
        },
      })
    }

    // Construir contexto
    const contexto = construirContextoParaIA(resultados)

    // Si hay API key de OpenRouter, usar IA para generar respuesta
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
          system: `Eres un asistente jurídico especializado en derecho penal mexicano.
Responde preguntas sobre el expediente basándote ÚNICAMENTE en el contexto proporcionado.
Si no encuentras la información en el contexto, dilo claramente.
Cita siempre la fuente de donde obtuviste la información.
Responde en español.`,
          prompt: `Contexto del expediente:\n\n${contexto}\n\nPregunta: ${consulta}`,
        })

        return NextResponse.json({
          data: {
            respuesta: text,
            fuentes: resultados.map(r => ({
              nombreArchivo: r.nombreArchivo,
              tipoDocumento: r.tipoDocumento,
              fragmento: r.fragmento,
              relevancia: r.relevancia,
            })),
            usandoIA: true,
          },
        })
      } catch (aiError) {
        console.error('Error con IA, usando fallback:', aiError)
      }
    }

    // Fallback sin IA: devolver fragmentos relevantes
    const respuesta = `Se encontraron ${resultados.length} resultado(s) relevante(s) en el expediente:\n\n` +
      resultados.map((r, i) =>
        `${i + 1}. **${r.nombreArchivo}** (relevancia: ${Math.round(r.relevancia * 100)}%)\n${r.fragmento}`
      ).join('\n\n')

    return NextResponse.json({
      data: {
        respuesta,
        fuentes: resultados.map(r => ({
          nombreArchivo: r.nombreArchivo,
          tipoDocumento: r.tipoDocumento,
          fragmento: r.fragmento,
          relevancia: r.relevancia,
        })),
        usandoIA: false,
      },
    })
  } catch (error) {
    console.error('POST consulta error:', error)
    return NextResponse.json({ error: 'Error al consultar expediente' }, { status: 500 })
  }
}
