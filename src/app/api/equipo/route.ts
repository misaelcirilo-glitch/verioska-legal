import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET: Listar miembros del despacho
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await queryOne<{ despacho_id: string | null; rol: string }>(
      'SELECT despacho_id, rol FROM users WHERE id = $1',
      [session.userId]
    )

    if (!user?.despacho_id) {
      return NextResponse.json({ data: [], despacho: null })
    }

    // Obtener info del despacho
    const despacho = await queryOne<{
      id: string
      nombre: string
      pais: string
      plan: string
    }>(
      'SELECT id, nombre, COALESCE(pais, \'MX\') as pais, COALESCE(plan, \'basico\') as plan FROM despachos WHERE id = $1',
      [user.despacho_id]
    )

    // Obtener miembros
    const miembros = await query(
      `SELECT id, email, nombre, apellidos, cedula_profesional, telefono, rol, activo, created_at,
              (SELECT COUNT(*) FROM expedientes WHERE user_id = users.id) as total_expedientes
       FROM users
       WHERE despacho_id = $1
       ORDER BY
         CASE rol WHEN 'admin' THEN 0 WHEN 'abogado' THEN 1 WHEN 'pasante' THEN 2 WHEN 'asistente' THEN 3 END,
         nombre ASC`,
      [user.despacho_id]
    )

    // Obtener invitaciones pendientes
    const invitaciones = await query(
      `SELECT i.id, i.email, i.rol, i.estado, i.created_at, i.expires_at,
              u.nombre || ' ' || u.apellidos as invitado_por_nombre
       FROM invitaciones i
       JOIN users u ON u.id = i.invitado_por
       WHERE i.despacho_id = $1 AND i.estado = 'pendiente' AND i.expires_at > NOW()
       ORDER BY i.created_at DESC`,
      [user.despacho_id]
    )

    return NextResponse.json({ data: miembros, despacho, invitaciones })
  } catch (error) {
    console.error('GET equipo error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: Agregar miembro directamente (con contraseña) o invitar por email
const agregarMiembroSchema = z.object({
  modo: z.enum(['directo', 'invitacion']),
  email: z.string().email('Email inválido'),
  nombre: z.string().min(1, 'Nombre requerido').optional(),
  apellidos: z.string().optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  rol: z.enum(['admin', 'abogado', 'pasante', 'asistente']).default('abogado'),
  cedulaProfesional: z.string().optional(),
  telefono: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar que es admin
    const currentUser = await queryOne<{ despacho_id: string | null; rol: string }>(
      'SELECT despacho_id, rol FROM users WHERE id = $1',
      [session.userId]
    )

    if (!currentUser?.despacho_id) {
      return NextResponse.json({ error: 'No tienes despacho asignado' }, { status: 400 })
    }

    if (currentUser.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden agregar miembros' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = agregarMiembroSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    // Verificar que el email no esté ya en el despacho
    const existente = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 AND despacho_id = $2',
      [d.email, currentUser.despacho_id]
    )

    if (existente) {
      return NextResponse.json({ error: 'Este email ya es miembro del despacho' }, { status: 400 })
    }

    if (d.modo === 'directo') {
      // Crear usuario directamente
      if (!d.nombre || !d.password) {
        return NextResponse.json({ error: 'Nombre y contraseña son requeridos para modo directo' }, { status: 400 })
      }

      // Verificar si ya existe como usuario (en otro despacho o sin despacho)
      const userExistente = await queryOne<{ id: string; despacho_id: string | null }>(
        'SELECT id, despacho_id FROM users WHERE email = $1',
        [d.email]
      )

      if (userExistente) {
        if (userExistente.despacho_id) {
          return NextResponse.json({ error: 'Este email ya pertenece a otro despacho' }, { status: 400 })
        }
        // Asignar al despacho
        const miembro = await queryOne(
          `UPDATE users SET despacho_id = $1, rol = $2, activo = TRUE, updated_at = NOW()
           WHERE id = $3 RETURNING id, email, nombre, apellidos, rol, activo`,
          [currentUser.despacho_id, d.rol, userExistente.id]
        )
        return NextResponse.json({ data: miembro }, { status: 200 })
      }

      const passwordHash = await bcrypt.hash(d.password, 12)
      const nuevoMiembro = await queryOne(
        `INSERT INTO users (email, password_hash, nombre, apellidos, cedula_profesional, telefono, despacho_id, rol)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, nombre, apellidos, cedula_profesional, telefono, rol, activo, created_at`,
        [
          d.email, passwordHash, d.nombre, d.apellidos || '',
          d.cedulaProfesional || null, d.telefono || null,
          currentUser.despacho_id, d.rol
        ]
      )

      return NextResponse.json({ data: nuevoMiembro }, { status: 201 })
    } else {
      // Crear invitación
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')

      const invitacion = await queryOne(
        `INSERT INTO invitaciones (despacho_id, email, rol, invitado_por, token)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, rol, estado, created_at, expires_at`,
        [currentUser.despacho_id, d.email, d.rol, session.userId, token.substring(0, 64)]
      )

      return NextResponse.json({ data: invitacion, token: token.substring(0, 64) }, { status: 201 })
    }
  } catch (error) {
    console.error('POST equipo error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
