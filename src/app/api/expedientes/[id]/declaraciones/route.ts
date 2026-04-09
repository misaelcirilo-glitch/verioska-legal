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

// Tolerante con cadenas vacias del frontend
const optionalString = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.string().optional()
)
const optionalUuid = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.string().uuid().optional()
)

const declaracionSchema = z.object({
  contenido: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  parteId: optionalUuid,
  documentoId: optionalUuid,
  fechaDeclaracion: optionalString,
  tipo: z.enum(['ministerial', 'judicial', 'ampliacion', 'careo', 'informativa', 'pericial']),
  contexto: optionalString,
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

    const declaraciones = await query<{
      id: string; contenido: string; tipo: string
      fecha_declaracion: string | null; contexto: string | null
      parte_id: string | null; documento_id: string | null
      created_at: string
    }>(
      `SELECT d.*, p.nombre as parte_nombre, p.apellidos as parte_apellidos, p.tipo as parte_tipo
       FROM declaraciones d
       LEFT JOIN partes p ON p.id = d.parte_id
       WHERE d.expediente_id = $1
       ORDER BY d.created_at DESC`,
      [id]
    )

    return NextResponse.json({ data: declaraciones })
  } catch (error) {
    console.error('GET declaraciones error:', error)
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
    const parsed = declaracionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    const declaracion = await queryOne(
      `INSERT INTO declaraciones (
        expediente_id, contenido, parte_id, documento_id,
        fecha_declaracion, tipo, contexto
      ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        id, d.contenido, d.parteId || null, d.documentoId || null,
        d.fechaDeclaracion || null, d.tipo, d.contexto || null,
      ]
    )

    return NextResponse.json({ data: declaracion }, { status: 201 })
  } catch (error) {
    console.error('POST declaracion error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
