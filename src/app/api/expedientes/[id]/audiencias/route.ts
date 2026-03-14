import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    'SELECT id FROM expedientes WHERE id = $1 AND user_id = $2',
    [expedienteId, userId]
  )
}

const audienciaSchema = z.object({
  tipoAudiencia: z.enum([
    'control_detencion', 'formulacion_imputacion', 'vinculacion_proceso',
    'medidas_cautelares', 'plazo_cierre_investigacion', 'intermedia',
    'juicio_oral', 'individualizacion_sancion', 'ejecucion',
    'amparo', 'apelacion', 'otra',
  ]),
  fechaProgramada: z.string(),
  sala: z.string().optional(),
  juzgado: z.string().optional(),
  juez: z.string().optional(),
  notas: z.string().optional(),
})

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

    const audiencias = await query(
      'SELECT * FROM audiencias WHERE expediente_id = $1 ORDER BY fecha_programada ASC',
      [id]
    )

    return NextResponse.json({ data: audiencias })
  } catch (error) {
    console.error('GET audiencias error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
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

    const body = await request.json()
    const parsed = audienciaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    const audiencia = await queryOne(
      `INSERT INTO audiencias (
        expediente_id, tipo_audiencia, fecha_programada, sala, juzgado, juez, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, d.tipoAudiencia, d.fechaProgramada, d.sala || null, d.juzgado || null, d.juez || null, d.notas || null]
    )

    return NextResponse.json({ data: audiencia }, { status: 201 })
  } catch (error) {
    console.error('POST audiencia error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
