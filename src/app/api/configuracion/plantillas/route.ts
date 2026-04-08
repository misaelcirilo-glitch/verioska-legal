import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

const CATEGORIAS = ['escrito', 'demanda', 'contestacion', 'recurso', 'otro'] as const

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const plantillas = await query(
    `SELECT p.*, u.nombre as creado_por_nombre, u.apellidos as creado_por_apellidos
     FROM plantillas_despacho p
     LEFT JOIN users u ON u.id = p.creado_por
     WHERE p.despacho_id = (SELECT despacho_id FROM users WHERE id = $1)
       AND p.activo = true
     ORDER BY p.categoria, p.nombre`,
    [session.userId]
  )

  return NextResponse.json({ data: plantillas })
}

const schema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  categoria: z.enum(CATEGORIAS),
  descripcion: z.string().optional(),
  contenido: z.string().min(1, 'Contenido requerido'),
  variables: z.array(z.string()).optional(),
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

  const { nombre, categoria, descripcion, contenido, variables } = parsed.data

  const plantilla = await queryOne(
    `INSERT INTO plantillas_despacho (despacho_id, nombre, categoria, descripcion, contenido, variables, creado_por)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [user.despacho_id, nombre, categoria, descripcion || null, contenido, JSON.stringify(variables || []), session.userId]
  )

  return NextResponse.json({ data: plantilla }, { status: 201 })
}
