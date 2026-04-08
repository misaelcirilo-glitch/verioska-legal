import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const accesos = await query(
    `SELECT id, tipo, ip, user_agent, created_at
     FROM accesos_log
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [session.userId]
  )

  return NextResponse.json({ data: accesos })
}
