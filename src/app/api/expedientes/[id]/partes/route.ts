import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { marcarPartePrincipal } from '@/lib/partes-sync'

// Scoping por despacho (PRP-005), coherente con el listado y el detalle.
async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string; despacho_id: string | null }>(
    `SELECT id, despacho_id FROM expedientes
      WHERE id = $1
        AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
    [expedienteId, userId]
  )
}

const parteSchema = z.object({
  tipo: z.enum([
    'imputado', 'victima', 'testigo', 'perito',
    'ministerio_publico', 'defensor', 'asesor_juridico', 'juez', 'policia',
    'demandante', 'demandado', 'denunciante', 'agraviado',
  ]),
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidos: z.string().optional(),
  alias: z.string().optional(),
  edad: z.number().int().positive().optional(),
  genero: z.string().optional(),
  notas: z.string().optional(),
  clienteId: z.preprocess((v) => (v === '' || v === null ? undefined : v), z.string().uuid().optional()),
  esPrincipal: z.boolean().optional(),
})

// Roles que cuentan como "el cliente principal del expediente"
const ROLES_PRINCIPALES = ['imputado', 'demandante', 'denunciante', 'agraviado']

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

    const partes = await query(
      `SELECT p.*, c.nombre as cliente_nombre, c.apellidos as cliente_apellidos
       FROM partes p
       LEFT JOIN clientes c ON c.id = p.cliente_id
       WHERE p.expediente_id = $1
       ORDER BY p.created_at`,
      [id]
    )

    return NextResponse.json({ data: partes })
  } catch (error) {
    console.error('GET partes error:', error)
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
    const parsed = parteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    const parte = await queryOne<{ id: string }>(
      `INSERT INTO partes (
        expediente_id, tipo, nombre, apellidos, alias, edad, genero, notas, cliente_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, d.tipo, d.nombre, d.apellidos || null, d.alias || null, d.edad || null, d.genero || null, d.notas || null, d.clienteId || null]
    )

    if (d.esPrincipal && parte) {
      // Marcado explícito al registrar → sync inversa completa (crea cliente si
      // es manual, único principal, apunta expedientes.cliente_id).
      await marcarPartePrincipal({
        expedienteId: id,
        parteId: parte.id,
        despachoId: owns.despacho_id,
        clienteIdActual: d.clienteId || null,
        nombre: d.nombre,
        apellidos: d.apellidos || null,
      })
    } else if (d.clienteId && ROLES_PRINCIPALES.includes(d.tipo)) {
      // Sin marcado explícito: vínculo blando por rol principal (solo si el
      // expediente aún no tiene cliente), comportamiento previo.
      await query(
        `UPDATE expedientes SET cliente_id = $1, updated_at = NOW()
         WHERE id = $2 AND cliente_id IS NULL`,
        [d.clienteId, id]
      )
    }

    const creada = await queryOne(
      `SELECT p.*, c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos
         FROM partes p LEFT JOIN clientes c ON c.id = p.cliente_id
        WHERE p.id = $1`,
      [parte?.id]
    )
    return NextResponse.json({ data: creada }, { status: 201 })
  } catch (error) {
    console.error('POST parte error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
