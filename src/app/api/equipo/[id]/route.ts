import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

const updateSchema = z.object({
  rol: z.enum(['admin', 'abogado', 'pasante', 'asistente']).optional(),
  activo: z.boolean().optional(),
})

// PATCH: Actualizar rol o estado activo de un miembro
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que es admin
    const currentUser = await queryOne<{ despacho_id: string | null; rol: string }>(
      'SELECT despacho_id, rol FROM users WHERE id = $1',
      [session.userId]
    )

    if (currentUser?.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden modificar miembros' }, { status: 403 })
    }

    // No puede modificarse a sí mismo
    if (id === session.userId) {
      return NextResponse.json({ error: 'No puedes modificar tu propio rol' }, { status: 400 })
    }

    // Verificar que el miembro pertenece al mismo despacho
    const miembro = await queryOne<{ id: string; despacho_id: string | null }>(
      'SELECT id, despacho_id FROM users WHERE id = $1',
      [id]
    )

    if (!miembro || miembro.despacho_id !== currentUser?.despacho_id) {
      return NextResponse.json({ error: 'Miembro no encontrado en tu despacho' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data
    const updates: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (d.rol !== undefined) {
      updates.push(`rol = $${paramIndex++}`)
      values.push(d.rol)
    }
    if (d.activo !== undefined) {
      updates.push(`activo = $${paramIndex++}`)
      values.push(d.activo)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const updated = await queryOne(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, nombre, apellidos, rol, activo`,
      values
    )

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('PATCH equipo error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE: Remover miembro del despacho (no elimina la cuenta, solo desvincula)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params

    const currentUser = await queryOne<{ despacho_id: string | null; rol: string }>(
      'SELECT despacho_id, rol FROM users WHERE id = $1',
      [session.userId]
    )

    if (currentUser?.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden remover miembros' }, { status: 403 })
    }

    if (id === session.userId) {
      return NextResponse.json({ error: 'No puedes removerte a ti mismo' }, { status: 400 })
    }

    const miembro = await queryOne<{ despacho_id: string | null }>(
      'SELECT despacho_id FROM users WHERE id = $1',
      [id]
    )

    if (!miembro || miembro.despacho_id !== currentUser?.despacho_id) {
      return NextResponse.json({ error: 'Miembro no encontrado en tu despacho' }, { status: 404 })
    }

    await queryOne(
      'UPDATE users SET despacho_id = NULL, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    )

    return NextResponse.json({ message: 'Miembro removido del despacho' })
  } catch (error) {
    console.error('DELETE equipo error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
