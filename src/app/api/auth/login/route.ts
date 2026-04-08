import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { createToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const user = await queryOne<{
      id: string
      email: string
      password_hash: string
      nombre: string
      apellidos: string
      cedula_profesional: string | null
      telefono: string | null
      rol: string
      activo: boolean
    }>(
      'SELECT id, email, password_hash, nombre, apellidos, cedula_profesional, telefono, rol, activo FROM users WHERE email = $1',
      [email]
    )

    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!user.activo) {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      rol: user.rol,
    })

    const response = NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        cedulaProfesional: user.cedula_profesional,
        telefono: user.telefono,
        rol: user.rol,
      },
    })

    response.cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
