import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

const schema = z.object({
  current_password: z.string().min(1, 'Password actual requerido'),
  new_password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { current_password, new_password } = parsed.data

  const user = await queryOne<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = $1',
    [session.userId]
  )

  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const valid = await bcrypt.compare(current_password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Password actual incorrecto' }, { status: 400 })
  }

  const newHash = await bcrypt.hash(new_password, 12)
  await query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHash, session.userId]
  )

  // Log
  await query(
    `INSERT INTO accesos_log (user_id, email, tipo) VALUES ($1, $2, 'password_change')`,
    [session.userId, session.email]
  )

  return NextResponse.json({ ok: true })
}
