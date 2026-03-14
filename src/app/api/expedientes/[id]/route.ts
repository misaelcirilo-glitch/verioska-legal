import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

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

    const expediente = await queryOne(
      'SELECT * FROM expedientes WHERE id = $1 AND user_id = $2',
      [id, session.userId]
    )

    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    // Also fetch partes
    const partes = await query(
      'SELECT * FROM partes WHERE expediente_id = $1 ORDER BY created_at',
      [id]
    )

    // Fetch active plazos
    const plazos = await query(
      "SELECT * FROM plazos WHERE expediente_id = $1 AND estado != 'cancelado' ORDER BY fecha_limite ASC",
      [id]
    )

    // Fetch upcoming audiencias
    const audiencias = await query(
      'SELECT * FROM audiencias WHERE expediente_id = $1 ORDER BY fecha_programada ASC',
      [id]
    )

    return NextResponse.json({
      data: { expediente, partes, plazos, audiencias },
    })
  } catch (error) {
    console.error('GET expediente error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
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

    const body = await request.json()
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    const allowedFields: Record<string, string> = {
      delito: 'delito',
      nuc: 'nuc',
      carpetaInvestigacion: 'carpeta_investigacion',
      causaPenal: 'causa_penal',
      juzgado: 'juzgado',
      distritoJudicial: 'distrito_judicial',
      fiscalia: 'fiscalia',
      etapaProcesal: 'etapa_procesal',
      fechaHechos: 'fecha_hechos',
      fechaDetencion: 'fecha_detencion',
      fechaPuestaDisposicion: 'fecha_puesta_disposicion',
      fechaFormulacion: 'fecha_formulacion',
      fechaVinculacion: 'fecha_vinculacion',
      fechaCierreComplementaria: 'fecha_cierre_complementaria',
      duplicidadTermino: 'duplicidad_termino',
      estado: 'estado',
      notas: 'notas',
    }

    for (const [camel, snake] of Object.entries(allowedFields)) {
      if (camel in body) {
        fields.push(`${snake} = $${idx}`)
        values.push(body[camel])
        idx++
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const updated = await queryOne(
      `UPDATE expedientes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('PUT expediente error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
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

    await queryOne('DELETE FROM expedientes WHERE id = $1', [id])
    return NextResponse.json({ data: { ok: true } })
  } catch (error) {
    console.error('DELETE expediente error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
