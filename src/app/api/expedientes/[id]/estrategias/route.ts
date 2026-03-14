import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generarEstrategias } from '@/features/estrategia/services/generador-estrategias'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    'SELECT id FROM expedientes WHERE id = $1 AND user_id = $2',
    [expedienteId, userId]
  )
}

export async function GET(
  _request: NextRequest,
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

    const estrategias = await query(
      'SELECT * FROM estrategias WHERE expediente_id = $1 ORDER BY confianza DESC, created_at DESC',
      [id]
    )

    return NextResponse.json({ data: estrategias })
  } catch (error) {
    console.error('GET estrategias error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: Generar estrategias automáticamente
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const expediente = await queryOne<{
      id: string; etapa_procesal: string; delito: string
      duplicidad_termino: boolean; fecha_detencion: string | null
      fecha_formulacion: string | null; fecha_vinculacion: string | null
      pais: string | null; complejidad: string | null
    }>(
      'SELECT * FROM expedientes WHERE id = $1 AND user_id = $2',
      [id, session.userId]
    )

    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    // Recopilar contexto del expediente
    const [hechos, contradicciones, plazosVencidos] = await Promise.all([
      query<{ descripcion: string; relevancia: string }>(
        'SELECT descripcion, relevancia FROM hechos WHERE expediente_id = $1',
        [id]
      ),
      query<{ tema: string; severidad: string }>(
        'SELECT tema, severidad FROM contradicciones WHERE expediente_id = $1',
        [id]
      ),
      query<{ id: string }>(
        "SELECT id FROM plazos WHERE expediente_id = $1 AND estado = 'vencido'",
        [id]
      ),
    ])

    const estrategias = generarEstrategias({
      etapaProcesal: expediente.etapa_procesal,
      delito: expediente.delito,
      duplicidadTermino: expediente.duplicidad_termino,
      tieneDetencion: !!expediente.fecha_detencion,
      tieneFormulacion: !!expediente.fecha_formulacion,
      tieneVinculacion: !!expediente.fecha_vinculacion,
      hechos,
      contradicciones,
      plazosVencidos: plazosVencidos.length,
      pais: expediente.pais || 'MX',
      complejidad: expediente.complejidad || undefined,
    })

    // Insertar en BD (evitar duplicados por título)
    const insertadas = []
    for (const e of estrategias) {
      const existe = await queryOne(
        'SELECT id FROM estrategias WHERE expediente_id = $1 AND titulo = $2',
        [id, e.titulo]
      )
      if (existe) continue

      const row = await queryOne(
        `INSERT INTO estrategias (
          expediente_id, tipo, titulo, descripcion,
          fundamento_legal, articulos_cnpp, confianza
        ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [id, e.tipo, e.titulo, e.descripcion, e.fundamentoLegal, e.articulosCnpp, e.confianza]
      )
      insertadas.push(row)
    }

    return NextResponse.json({
      data: { generadas: insertadas.length, estrategias: insertadas },
    }, { status: 201 })
  } catch (error) {
    console.error('POST estrategias error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
