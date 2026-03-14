import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  buscarJurisprudencia,
  obtenerTemasDisponibles,
} from '@/features/jurisprudencia/services/catalogo-jurisprudencia'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const consulta = searchParams.get('q') || undefined
    const pais = (searchParams.get('pais') as 'MX' | 'PE') || undefined
    const tema = searchParams.get('tema') || undefined
    const etapa = searchParams.get('etapa') || undefined
    const delito = searchParams.get('delito') || undefined
    const soloTemas = searchParams.get('temas') === '1'

    if (soloTemas) {
      const temas = obtenerTemasDisponibles(pais)
      return NextResponse.json({ data: { temas } })
    }

    const resultados = buscarJurisprudencia({ consulta, pais, tema, etapa, delito })

    return NextResponse.json({
      data: {
        total: resultados.length,
        jurisprudencia: resultados,
      },
    })
  } catch (error) {
    console.error('GET jurisprudencia error:', error)
    return NextResponse.json({ error: 'Error al buscar jurisprudencia' }, { status: 500 })
  }
}
