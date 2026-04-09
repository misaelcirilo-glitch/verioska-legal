import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import {
  buscarDelitos,
  obtenerFactores,
  calcularDosificacion,
  type RangoPena,
  type FactorDosificacion,
} from '@/features/dosificacion/services/calculador-penas'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string; pais: string | null; delito: string | null }>(
    `SELECT e.id, e.pais, e.delito FROM expedientes e
     WHERE e.id = $1
       AND (e.user_id = $2
            OR e.despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
    [expedienteId, userId]
  )
}

// GET: obtener dosificaciones guardadas + catálogo de delitos
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

    const { searchParams } = new URL(request.url)
    const catalogo = searchParams.get('catalogo') === '1'
    const pais = (expediente.pais || 'MX') as 'MX' | 'PE'

    if (catalogo) {
      const delitos = buscarDelitos(pais)
      const factores = obtenerFactores(pais)
      return NextResponse.json({ data: { delitos, factores } })
    }

    const dosificaciones = await query(
      'SELECT * FROM dosificaciones WHERE expediente_id = $1 ORDER BY created_at DESC',
      [id]
    )

    return NextResponse.json({ data: { dosificaciones } })
  } catch (error) {
    console.error('GET dosificacion error:', error)
    return NextResponse.json({ error: 'Error al obtener dosificación' }, { status: 500 })
  }
}

// POST: calcular y guardar dosificación
const dosificacionSchema = z.object({
  delitoNombre: z.string().min(1),
  agravantes: z.array(z.string()).default([]),
  atenuantes: z.array(z.string()).default([]),
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
    const parsed = dosificacionSchema.parse(body)
    const pais = (expediente.pais || 'MX') as 'MX' | 'PE'

    // Buscar delito en catálogo
    const delitos = buscarDelitos(pais, parsed.delitoNombre)
    if (delitos.length === 0) {
      return NextResponse.json({ error: 'Delito no encontrado en catálogo' }, { status: 400 })
    }
    const delito: RangoPena = delitos[0]

    // Obtener factores completos
    const factoresDisponibles = obtenerFactores(pais)
    const agravantesSeleccionados: FactorDosificacion[] = factoresDisponibles.agravantes
      .filter(a => parsed.agravantes.includes(a.factor))
    const atenuantesSeleccionados: FactorDosificacion[] = factoresDisponibles.atenuantes
      .filter(a => parsed.atenuantes.includes(a.factor))

    // Calcular dosificación
    const resultado = calcularDosificacion({
      delito,
      agravantes: agravantesSeleccionados,
      atenuantes: atenuantesSeleccionados,
    })

    // Guardar en BD
    const saved = await queryOne(
      `INSERT INTO dosificaciones (
        expediente_id, delito, pais, codigo_penal, articulo,
        pena_minima_meses, pena_maxima_meses,
        agravantes, atenuantes,
        pena_sugerida_meses, sustitucion_posible, procedimiento_abreviado, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        id,
        resultado.delito,
        resultado.pais,
        delito.codigoPenal,
        delito.articulo,
        resultado.penaAjustada.minMeses,
        resultado.penaAjustada.maxMeses,
        JSON.stringify(agravantesSeleccionados),
        JSON.stringify(atenuantesSeleccionados),
        resultado.penaSugeridaMeses,
        resultado.sustitucionPosible,
        delito.admiteAbreviado,
        resultado.notas.join(' | '),
      ]
    )

    return NextResponse.json({ data: { dosificacion: saved, resultado } }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', detalles: error.issues }, { status: 400 })
    }
    console.error('POST dosificacion error:', error)
    return NextResponse.json({ error: 'Error al calcular dosificación' }, { status: 500 })
  }
}
