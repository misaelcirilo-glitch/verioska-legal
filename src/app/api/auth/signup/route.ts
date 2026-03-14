import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { createToken } from '@/lib/auth'

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  cedulaProfesional: z.string().optional(),
  telefono: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, nombre, apellidos, cedulaProfesional, telefono } = parsed.data

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await queryOne<{
      id: string
      email: string
      nombre: string
      apellidos: string
      cedula_profesional: string | null
      telefono: string | null
      rol: string
    }>(
      `INSERT INTO users (email, password_hash, nombre, apellidos, cedula_profesional, telefono)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, nombre, apellidos, cedula_profesional, telefono, rol`,
      [email, passwordHash, nombre, apellidos, cedulaProfesional || null, telefono || null]
    )

    if (!user) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
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
    }, { status: 201 })

    response.cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
