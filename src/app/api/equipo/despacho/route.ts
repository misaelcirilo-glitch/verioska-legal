import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { getSession, createToken } from '@/lib/auth'

// POST: Crear despacho (para usuarios que aún no tienen uno)
const crearDespachoSchema = z.object({
  nombre: z.string().min(1, 'Nombre del despacho requerido'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  pais: z.enum(['MX', 'PE']).default('MX'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar que no tiene despacho
    const user = await queryOne<{ despacho_id: string | null }>(
      'SELECT despacho_id FROM users WHERE id = $1',
      [session.userId]
    )

    if (user?.despacho_id) {
      return NextResponse.json({ error: 'Ya perteneces a un despacho' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = crearDespachoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    // Crear despacho
    const despacho = await queryOne<{ id: string }>(
      `INSERT INTO despachos (nombre, direccion, telefono, email, pais)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [d.nombre, d.direccion || null, d.telefono || null, d.email || null, d.pais]
    )

    if (!despacho) {
      return NextResponse.json({ error: 'Error al crear despacho' }, { status: 500 })
    }

    // Asignar usuario como admin del despacho
    await queryOne(
      'UPDATE users SET despacho_id = $1, rol = $2, updated_at = NOW() WHERE id = $3 RETURNING id',
      [despacho.id, 'admin', session.userId]
    )

    // Renovar token con despachoId
    const token = await createToken({
      userId: session.userId,
      email: session.email,
      rol: 'admin',
      despachoId: despacho.id,
    })

    const response = NextResponse.json({ data: { despachoId: despacho.id } }, { status: 201 })
    response.cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('POST despacho error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH: Actualizar datos del despacho
const updateDespachoSchema = z.object({
  nombre: z.string().min(1).optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const currentUser = await queryOne<{ despacho_id: string | null; rol: string }>(
      'SELECT despacho_id, rol FROM users WHERE id = $1',
      [session.userId]
    )

    if (!currentUser?.despacho_id) {
      return NextResponse.json({ error: 'No tienes despacho' }, { status: 400 })
    }

    if (currentUser.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden editar el despacho' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateDespachoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data
    const updates: string[] = []
    const values: unknown[] = []
    let i = 1

    if (d.nombre !== undefined) { updates.push(`nombre = $${i++}`); values.push(d.nombre) }
    if (d.direccion !== undefined) { updates.push(`direccion = $${i++}`); values.push(d.direccion || null) }
    if (d.telefono !== undefined) { updates.push(`telefono = $${i++}`); values.push(d.telefono || null) }
    if (d.email !== undefined) { updates.push(`email = $${i++}`); values.push(d.email || null) }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    values.push(currentUser.despacho_id)

    const updated = await queryOne(
      `UPDATE despachos SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    )

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('PATCH despacho error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
