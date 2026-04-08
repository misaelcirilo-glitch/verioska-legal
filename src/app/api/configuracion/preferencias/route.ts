import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

interface Preferences {
  user_id: string
  idioma: string
  formato_fecha: string
  zona_horaria: string
  tema: string
  notif_audiencias: boolean
  notif_plazos: boolean
  notif_sistema: boolean
  notif_email: boolean
  notif_frecuencia: string
  twofa_enabled: boolean
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let prefs = await queryOne<Preferences>(
    'SELECT * FROM user_preferences WHERE user_id = $1',
    [session.userId]
  )

  // Crear con defaults si no existe
  if (!prefs) {
    prefs = await queryOne<Preferences>(
      'INSERT INTO user_preferences (user_id) VALUES ($1) RETURNING *',
      [session.userId]
    )
  }

  return NextResponse.json({ data: prefs })
}

const schema = z.object({
  idioma: z.enum(['es', 'en']).optional(),
  formato_fecha: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
  zona_horaria: z.string().optional(),
  tema: z.enum(['light', 'dark']).optional(),
  notif_audiencias: z.boolean().optional(),
  notif_plazos: z.boolean().optional(),
  notif_sistema: z.boolean().optional(),
  notif_email: z.boolean().optional(),
  notif_frecuencia: z.enum(['inmediata', 'diaria', 'semanal']).optional(),
})

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Asegurar que existe
  await query(
    'INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
    [session.userId]
  )

  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) {
      fields.push(`${k} = $${idx}`)
      values.push(v)
      idx++
    }
  }

  if (fields.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })

  fields.push('updated_at = NOW()')
  values.push(session.userId)

  const updated = await queryOne(
    `UPDATE user_preferences SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
    values
  )

  return NextResponse.json({ data: updated })
}
