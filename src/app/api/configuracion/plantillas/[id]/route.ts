import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

const schema = z.object({
  nombre: z.string().min(1).optional(),
  categoria: z.enum(['escrito', 'demanda', 'contestacion', 'recurso', 'otro']).optional(),
  descripcion: z.string().optional(),
  contenido: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) {
      fields.push(`${k} = $${idx}`)
      values.push(k === 'variables' ? JSON.stringify(v) : v)
      idx++
    }
  }

  if (fields.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })

  fields.push('updated_at = NOW()')
  values.push(id, session.userId)

  const updated = await queryOne(
    `UPDATE plantillas_despacho SET ${fields.join(', ')}
     WHERE id = $${idx}
       AND despacho_id = (SELECT despacho_id FROM users WHERE id = $${idx + 1})
     RETURNING *`,
    values
  )

  if (!updated) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json({ data: updated })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params

  await query(
    `UPDATE plantillas_despacho SET activo = false
     WHERE id = $1
       AND despacho_id = (SELECT despacho_id FROM users WHERE id = $2)`,
    [id, session.userId]
  )

  return NextResponse.json({ ok: true })
}
