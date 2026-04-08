import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params

  await query(
    `DELETE FROM integraciones
     WHERE id = $1
       AND despacho_id = (SELECT despacho_id FROM users WHERE id = $2)`,
    [id, session.userId]
  )

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const { activo } = await request.json()

  await query(
    `UPDATE integraciones SET activo = $1, updated_at = NOW()
     WHERE id = $2
       AND despacho_id = (SELECT despacho_id FROM users WHERE id = $3)`,
    [activo, id, session.userId]
  )

  return NextResponse.json({ ok: true })
}
