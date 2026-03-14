import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

const clienteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidos: z.string().optional(),
  tipoDocumento: z.enum(['dni', 'ce', 'pasaporte', 'ine', 'curp', 'ruc', 'rfc']).optional(),
  numeroDocumento: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  estado: z.enum(['prospecto', 'activo', 'inactivo', 'archivado']).default('activo'),
  fuente: z.enum(['referido', 'web', 'redes_sociales', 'directorio', 'otro']).optional(),
  notas: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const clientes = await query(
      `SELECT c.*, COUNT(e.id) as total_expedientes
       FROM clientes c
       LEFT JOIN expedientes e ON e.cliente_id = c.id
       WHERE c.despacho_id = (SELECT despacho_id FROM users WHERE id = $1)
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
      [session.userId]
    )

    return NextResponse.json({ data: clientes })
  } catch (error) {
    console.error('GET clientes error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = clienteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    // Obtener despacho_id del usuario
    const user = await queryOne<{ despacho_id: string | null }>(
      'SELECT despacho_id FROM users WHERE id = $1',
      [session.userId]
    )

    if (!user?.despacho_id) {
      return NextResponse.json({ error: 'Usuario sin despacho asignado' }, { status: 400 })
    }

    const cliente = await queryOne(
      `INSERT INTO clientes (
        despacho_id, nombre, apellidos, tipo_documento, numero_documento,
        telefono, email, direccion, estado, fuente, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        user.despacho_id, d.nombre, d.apellidos || null,
        d.tipoDocumento || null, d.numeroDocumento || null,
        d.telefono || null, d.email || null, d.direccion || null,
        d.estado, d.fuente || null, d.notas || null,
      ]
    )

    return NextResponse.json({ data: cliente }, { status: 201 })
  } catch (error) {
    console.error('POST cliente error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
