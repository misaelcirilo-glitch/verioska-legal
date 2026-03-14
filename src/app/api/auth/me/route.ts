import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { queryOne } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const user = await queryOne<{
      id: string
      email: string
      nombre: string
      apellidos: string
      cedula_profesional: string | null
      telefono: string | null
      rol: string
      despacho_id: string | null
    }>(
      'SELECT id, email, nombre, apellidos, cedula_profesional, telefono, rol, despacho_id FROM users WHERE id = $1',
      [session.userId]
    )

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        cedulaProfesional: user.cedula_profesional,
        telefono: user.telefono,
        rol: user.rol,
        despachoId: user.despacho_id,
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
