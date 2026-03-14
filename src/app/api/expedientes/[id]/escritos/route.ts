import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generarEscrito, getTiposEscrito } from '@/features/escritos/services/generador-escritos'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    'SELECT id FROM expedientes WHERE id = $1 AND user_id = $2',
    [expedienteId, userId]
  )
}

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

    const escritos = await query(
      'SELECT * FROM escritos WHERE expediente_id = $1 ORDER BY created_at DESC',
      [id]
    )

    return NextResponse.json({ data: escritos, tiposDisponibles: getTiposEscrito() })
  } catch (error) {
    console.error('GET escritos error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

const escritoSchema = z.object({
  tipoEscrito: z.string().min(1),
})

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
    const expediente = await queryOne<{
      id: string; nuc: string | null; carpeta_investigacion: string | null
      causa_penal: string | null; delito: string; juzgado: string | null
      distrito_judicial: string | null; fiscalia: string | null
      etapa_procesal: string; user_id: string
    }>(
      'SELECT * FROM expedientes WHERE id = $1 AND user_id = $2',
      [id, session.userId]
    )

    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = escritoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Obtener partes relevantes
    const partes = await query<{
      tipo: string; nombre: string; apellidos: string | null
    }>(
      'SELECT tipo, nombre, apellidos FROM partes WHERE expediente_id = $1',
      [id]
    )

    const imputado = partes.find(p => p.tipo === 'imputado') || null
    const victima = partes.find(p => p.tipo === 'victima') || null
    const defensor = partes.find(p => p.tipo === 'defensor') || null

    const escrito = generarEscrito(parsed.data.tipoEscrito, {
      nuc: expediente.nuc,
      carpetaInvestigacion: expediente.carpeta_investigacion,
      causaPenal: expediente.causa_penal,
      delito: expediente.delito,
      juzgado: expediente.juzgado,
      distritoJudicial: expediente.distrito_judicial,
      fiscalia: expediente.fiscalia,
      etapaProcesal: expediente.etapa_procesal,
      imputado,
      victima,
      defensor,
    })

    // Guardar en BD
    const row = await queryOne(
      `INSERT INTO escritos (
        expediente_id, tipo_escrito, titulo, contenido
      ) VALUES ($1,$2,$3,$4) RETURNING *`,
      [id, escrito.tipoEscrito, escrito.titulo, escrito.contenido]
    )

    return NextResponse.json({ data: row }, { status: 201 })
  } catch (error) {
    console.error('POST escrito error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
