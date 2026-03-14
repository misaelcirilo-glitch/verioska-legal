import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    'SELECT id FROM expedientes WHERE id = $1 AND user_id = $2',
    [expedienteId, userId]
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; audienciaId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { id, audienciaId } = await params
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const audiencia = await queryOne(
      'SELECT * FROM audiencias WHERE id = $1 AND expediente_id = $2',
      [audienciaId, id]
    )

    if (!audiencia) return NextResponse.json({ error: 'Audiencia no encontrada' }, { status: 404 })
    return NextResponse.json({ data: audiencia })
  } catch (error) {
    console.error('GET audiencia error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; audienciaId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { id, audienciaId } = await params
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const body = await request.json()
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    const allowed: Record<string, string> = {
      tipoAudiencia: 'tipo_audiencia',
      fechaProgramada: 'fecha_programada',
      fechaRealizada: 'fecha_realizada',
      sala: 'sala',
      juzgado: 'juzgado',
      juez: 'juez',
      estado: 'estado',
      resultado: 'resultado',
      notas: 'notas',
    }

    for (const [camel, snake] of Object.entries(allowed)) {
      if (camel in body) {
        fields.push(`${snake} = $${idx}`)
        values.push(body[camel])
        idx++
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    fields.push('updated_at = NOW()')
    values.push(audienciaId, id)

    const updated = await queryOne(
      `UPDATE audiencias SET ${fields.join(', ')} WHERE id = $${idx} AND expediente_id = $${idx + 1} RETURNING *`,
      values
    )

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('PUT audiencia error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; audienciaId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { id, audienciaId } = await params
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    await queryOne(
      'DELETE FROM audiencias WHERE id = $1 AND expediente_id = $2',
      [audienciaId, id]
    )

    return NextResponse.json({ data: { ok: true } })
  } catch (error) {
    console.error('DELETE audiencia error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
