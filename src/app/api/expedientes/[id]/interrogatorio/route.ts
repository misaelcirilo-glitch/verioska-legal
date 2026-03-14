import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import { generarPlanInterrogatorio } from '@/features/interrogatorio/services/generador-interrogatorio'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string; pais: string; delito: string; etapa_procesal: string }>(
    `SELECT e.id, e.pais, e.delito, e.etapa_procesal FROM expedientes e
     WHERE e.id = $1 AND e.user_id = $2`,
    [expedienteId, userId]
  )
}

// GET: obtener interrogatorios guardados
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const expediente = await verifyOwnership(id, session.userId)
    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const interrogatorios = await query(
      `SELECT i.*, p.nombre AS parte_nombre, p.apellidos AS parte_apellidos, p.tipo AS parte_tipo
       FROM interrogatorios i
       LEFT JOIN partes p ON i.parte_id = p.id
       WHERE i.expediente_id = $1
       ORDER BY i.created_at DESC`,
      [id]
    )

    return NextResponse.json({ data: { interrogatorios } })
  } catch (error) {
    console.error('GET interrogatorio error:', error)
    return NextResponse.json({ error: 'Error al obtener interrogatorios' }, { status: 500 })
  }
}

// POST: generar plan de interrogatorio
const interrogatorioSchema = z.object({
  parteId: z.string().uuid(),
  tipo: z.enum(['examen_directo', 'contraexamen', 'reexamen']),
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
    const expediente = await verifyOwnership(id, session.userId)
    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = interrogatorioSchema.parse(body)
    const pais = (expediente.pais || 'MX') as 'MX' | 'PE'

    // Obtener datos de la parte
    const parte = await queryOne<{
      id: string; nombre: string; apellidos: string; tipo: string
    }>(
      'SELECT id, nombre, apellidos, tipo FROM partes WHERE id = $1 AND expediente_id = $2',
      [parsed.parteId, id]
    )
    if (!parte) {
      return NextResponse.json({ error: 'Parte no encontrada en este expediente' }, { status: 404 })
    }

    // Obtener hechos del caso
    const hechos = await query<{ descripcion: string }>(
      'SELECT descripcion FROM hechos WHERE expediente_id = $1',
      [id]
    )

    // Obtener contradicciones si es contraexamen
    let contradicciones: { tema: string; descripcion: string }[] = []
    if (parsed.tipo === 'contraexamen') {
      const contras = await query<{ tema: string; descripcion: string }>(
        `SELECT c.tema, c.descripcion FROM contradicciones c
         JOIN declaraciones d ON (c.declaracion_a_id = d.id OR c.declaracion_b_id = d.id)
         WHERE c.expediente_id = $1 AND d.parte_id = $2
         AND (c.severidad = 'critica' OR c.severidad = 'alta')`,
        [id, parsed.parteId]
      )
      contradicciones = contras
    }

    // Generar plan
    const plan = generarPlanInterrogatorio({
      pais,
      tipo: parsed.tipo,
      tipoParte: parte.tipo,
      nombreParte: `${parte.nombre} ${parte.apellidos || ''}`.trim(),
      delito: expediente.delito || '',
      etapaProcesal: expediente.etapa_procesal || '',
      hechosClave: hechos.map(h => h.descripcion),
      contradicciones: contradicciones.length > 0 ? contradicciones : undefined,
    })

    // Guardar en BD
    const saved = await queryOne(
      `INSERT INTO interrogatorios (
        expediente_id, parte_id, tipo, objetivo, preguntas, tecnica, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        id,
        parsed.parteId,
        parsed.tipo,
        plan.objetivo,
        JSON.stringify(plan.preguntas),
        plan.tecnica,
        plan.recomendaciones.join('\n'),
      ]
    )

    return NextResponse.json({ data: { interrogatorio: saved, plan } }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', detalles: error.issues }, { status: 400 })
    }
    console.error('POST interrogatorio error:', error)
    return NextResponse.json({ error: 'Error al generar interrogatorio' }, { status: 500 })
  }
}
