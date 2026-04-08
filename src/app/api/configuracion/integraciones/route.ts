import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const integraciones = await query(
    `SELECT id, tipo, nombre, activo, created_at
     FROM integraciones
     WHERE despacho_id = (SELECT despacho_id FROM users WHERE id = $1)
     ORDER BY tipo`,
    [session.userId]
  )

  return NextResponse.json({ data: integraciones })
}

const schema = z.object({
  tipo: z.enum(['smtp', 'google_calendar', 'outlook', 'drive']),
  nombre: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const user = await queryOne<{ despacho_id: string }>(
    'SELECT despacho_id FROM users WHERE id = $1',
    [session.userId]
  )
  if (!user?.despacho_id) {
    return NextResponse.json({ error: 'Sin despacho asignado' }, { status: 400 })
  }

  const { tipo, nombre, config } = parsed.data

  const integracion = await queryOne(
    `INSERT INTO integraciones (despacho_id, tipo, nombre, config)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (despacho_id, tipo)
     DO UPDATE SET nombre = EXCLUDED.nombre, config = EXCLUDED.config, updated_at = NOW()
     RETURNING id, tipo, nombre, activo, created_at`,
    [user.despacho_id, tipo, nombre || tipo, JSON.stringify(config || {})]
  )

  return NextResponse.json({ data: integracion }, { status: 201 })
}
