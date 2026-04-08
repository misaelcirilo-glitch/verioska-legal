import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { obtenerJurisprudenciaPorId } from '@/features/jurisprudencia/services/catalogo-jurisprudencia'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const guardadas = await query<{ jurisprudencia_id: string; notas: string | null; created_at: string }>(
    'SELECT jurisprudencia_id, notas, created_at FROM jurisprudencia_guardada WHERE user_id = $1 ORDER BY created_at DESC',
    [session.userId]
  )

  // Hidratar con catálogo
  const data = guardadas
    .map(g => {
      const j = obtenerJurisprudenciaPorId(g.jurisprudencia_id)
      if (!j) return null
      return { ...j, notas: g.notas, savedAt: g.created_at }
    })
    .filter(Boolean)

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { jurisprudencia_id, notas } = await request.json()
  if (!jurisprudencia_id) {
    return NextResponse.json({ error: 'jurisprudencia_id requerido' }, { status: 400 })
  }

  // Verificar que existe en catálogo
  if (!obtenerJurisprudenciaPorId(jurisprudencia_id)) {
    return NextResponse.json({ error: 'Jurisprudencia no encontrada' }, { status: 404 })
  }

  const result = await queryOne(
    `INSERT INTO jurisprudencia_guardada (user_id, jurisprudencia_id, notas)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, jurisprudencia_id) DO UPDATE SET notas = EXCLUDED.notas
     RETURNING *`,
    [session.userId, jurisprudencia_id, notas || null]
  )

  return NextResponse.json({ data: result }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  await query(
    'DELETE FROM jurisprudencia_guardada WHERE user_id = $1 AND jurisprudencia_id = $2',
    [session.userId, id]
  )

  return NextResponse.json({ ok: true })
}
