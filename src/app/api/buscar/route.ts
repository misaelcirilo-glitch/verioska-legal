import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ data: { expedientes: [], clientes: [], audiencias: [] } })

  const term = `%${q}%`
  const userId = session.userId

  const [expedientes, clientes, audiencias] = await Promise.all([
    query(
      `SELECT id, delito, nuc, carpeta_investigacion, numero_carpeta_fiscal,
              numero_expediente_judicial, juzgado, etapa_procesal, materia, 'expediente' as _type
       FROM expedientes
       WHERE (user_id = $1 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $1))
         AND (delito ILIKE $2 OR nuc ILIKE $2 OR carpeta_investigacion ILIKE $2
              OR numero_carpeta_fiscal ILIKE $2 OR numero_expediente_judicial ILIKE $2
              OR juzgado ILIKE $2 OR fiscalia ILIKE $2)
       ORDER BY updated_at DESC LIMIT 10`,
      [userId, term]
    ),
    query(
      `SELECT id, nombre, apellidos, telefono, email, tipo_documento, numero_documento, 'cliente' as _type
       FROM clientes
       WHERE despacho_id = (SELECT despacho_id FROM users WHERE id = $1)
         AND (nombre ILIKE $2 OR apellidos ILIKE $2 OR numero_documento ILIKE $2
              OR telefono ILIKE $2 OR email ILIKE $2)
       ORDER BY updated_at DESC LIMIT 10`,
      [userId, term]
    ),
    query(
      `SELECT a.id, a.tipo_audiencia, a.fecha_programada, a.sala, a.juzgado, a.expediente_id,
              e.delito, 'audiencia' as _type
       FROM audiencias a
       JOIN expedientes e ON e.id = a.expediente_id
       WHERE (e.user_id = $1 OR e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1))
         AND (a.tipo_audiencia ILIKE $2 OR a.juzgado ILIKE $2 OR a.sala ILIKE $2
              OR e.delito ILIKE $2)
       ORDER BY a.fecha_programada DESC LIMIT 10`,
      [userId, term]
    ),
  ])

  return NextResponse.json({
    data: { expedientes, clientes, audiencias },
    total: expedientes.length + clientes.length + audiencias.length,
  })
}
