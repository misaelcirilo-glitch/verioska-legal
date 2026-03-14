import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { detectarContradicciones } from '@/features/contradicciones/services/detector'

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

    const contradicciones = await query<{
      id: string; descripcion: string; tema: string | null
      severidad: string; utilidad_defensiva: string | null
      revisada: boolean; created_at: string
      declaracion_a_id: string; declaracion_b_id: string
    }>(
      'SELECT * FROM contradicciones WHERE expediente_id = $1 ORDER BY created_at DESC',
      [id]
    )

    return NextResponse.json({ data: contradicciones })
  } catch (error) {
    console.error('GET contradicciones error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: Analizar declaraciones y detectar contradicciones automáticamente
export async function POST(
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

    // Obtener todas las declaraciones del expediente
    const declaraciones = await query<{
      id: string; contenido: string; tipo: string
      parte_id: string | null
    }>(
      `SELECT d.id, d.contenido, d.tipo, d.parte_id,
              p.nombre as parte_nombre, p.apellidos as parte_apellidos, p.tipo as parte_tipo
       FROM declaraciones d
       LEFT JOIN partes p ON p.id = d.parte_id
       WHERE d.expediente_id = $1`,
      [id]
    )

    if (declaraciones.length < 2) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 2 declaraciones para analizar contradicciones' },
        { status: 400 }
      )
    }

    // Detectar contradicciones
    const contradicciones = detectarContradicciones(
      declaraciones.map((d: Record<string, unknown>) => ({
        id: d.id as string,
        contenido: d.contenido as string,
        tipo: d.tipo as string,
        parteNombre: d.parte_nombre as string | undefined,
        parteApellidos: d.parte_apellidos as string | undefined,
        parteTipo: d.parte_tipo as string | undefined,
      }))
    )

    // Insertar contradicciones en BD
    const insertadas = []
    for (const c of contradicciones) {
      // Verificar que no exista ya
      const existe = await queryOne(
        `SELECT id FROM contradicciones
         WHERE expediente_id = $1
         AND declaracion_a_id = $2
         AND declaracion_b_id = $3`,
        [id, c.declaracionAId, c.declaracionBId]
      )
      if (existe) continue

      const row = await queryOne(
        `INSERT INTO contradicciones (
          expediente_id, declaracion_a_id, declaracion_b_id,
          descripcion, tema, severidad, utilidad_defensiva
        ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [id, c.declaracionAId, c.declaracionBId, c.descripcion, c.tema, c.severidad, c.utilidadDefensiva]
      )
      insertadas.push(row)
    }

    return NextResponse.json({
      data: {
        analizadas: declaraciones.length,
        contradiccionesDetectadas: insertadas.length,
        contradicciones: insertadas,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('POST contradicciones error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
