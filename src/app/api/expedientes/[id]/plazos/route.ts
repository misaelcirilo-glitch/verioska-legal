import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  PLAZOS_CNPP,
  calcularFechaLimite,
  calcularEstadoPlazo,
  generarPlazosIniciales,
} from '@/features/plazos/services/motor-cnpp'
import { PLAZOS_NCPP, generarPlazosInicialesPeru } from '@/features/plazos/services/motor-ncpp'
import { PaisCode } from '@/lib/paises'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string; pais: string }>(
    'SELECT e.id, COALESCE(d.pais, \'MX\') as pais FROM expedientes e LEFT JOIN despachos d ON e.despacho_id = d.id WHERE e.id = $1 AND e.user_id = $2',
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

    const plazos = await query<{
      id: string
      tipo_plazo: string
      fundamento_legal: string | null
      descripcion: string | null
      fecha_inicio: string
      fecha_limite: string
      horas_totales: number | null
      dias_totales: number | null
      dias_habiles: boolean
      estado: string
      notas: string | null
    }>(
      'SELECT * FROM plazos WHERE expediente_id = $1 ORDER BY fecha_limite ASC',
      [id]
    )

    // Actualizar estados en tiempo real
    const plazosActualizados = plazos.map(p => {
      const fechaLimite = new Date(p.fecha_limite)
      const esHoras = p.horas_totales !== null
      const cantidad = p.horas_totales || p.dias_totales || 0

      let estadoActual = p.estado
      if (estadoActual !== 'cumplido' && estadoActual !== 'cancelado') {
        estadoActual = calcularEstadoPlazo(fechaLimite, cantidad, esHoras)
      }

      return {
        id: p.id,
        tipoPlazo: p.tipo_plazo,
        fundamentoLegal: p.fundamento_legal,
        descripcion: p.descripcion,
        fechaInicio: p.fecha_inicio,
        fechaLimite: p.fecha_limite,
        horasTotales: p.horas_totales,
        diasTotales: p.dias_totales,
        diasHabiles: p.dias_habiles,
        estado: estadoActual,
        notas: p.notas,
      }
    })

    // Actualizar estados en BD si cambiaron
    for (let i = 0; i < plazos.length; i++) {
      if (plazos[i].estado !== plazosActualizados[i].estado) {
        await queryOne(
          'UPDATE plazos SET estado = $1, updated_at = NOW() WHERE id = $2',
          [plazosActualizados[i].estado, plazos[i].id]
        )
      }
    }

    return NextResponse.json({ data: plazosActualizados })
  } catch (error) {
    console.error('GET plazos error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

const plazoManualSchema = z.object({
  autogenerar: z.literal(false).optional(),
  tipoPlazo: z.string().min(1),
  fundamentoLegal: z.string().optional(),
  descripcion: z.string().optional(),
  fechaInicio: z.string(),
  horas: z.number().optional(),
  dias: z.number().optional(),
  diasHabiles: z.boolean().default(false),
  notas: z.string().optional(),
})

const plazoAutoSchema = z.object({
  autogenerar: z.literal(true),
  fechaDetencion: z.string(),
  duplicidadTermino: z.boolean().default(false),
  pais: z.enum(['MX', 'PE']).optional(),
  complejidad: z.enum(['simple', 'complejo', 'crimen_organizado']).optional(),
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
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const body = await request.json()

    // Autogenerar plazos
    if (body.autogenerar === true) {
      const parsed = plazoAutoSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
      }

      const fechaDet = new Date(parsed.data.fechaDetencion)
      const paisExp = (parsed.data.pais || owns.pais || 'MX') as PaisCode
      const plazosGenerados = paisExp === 'PE'
        ? generarPlazosInicialesPeru(fechaDet, parsed.data.complejidad || 'simple')
        : generarPlazosIniciales(fechaDet, parsed.data.duplicidadTermino)

      const insertados = []
      for (const p of plazosGenerados) {
        const row = await queryOne(
          `INSERT INTO plazos (
            expediente_id, tipo_plazo, fundamento_legal, descripcion,
            fecha_inicio, fecha_limite, horas_totales, dias_totales, dias_habiles, estado
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
          [
            id, p.config.tipo, p.config.fundamentoLegal, p.config.descripcion,
            p.fechaInicio.toISOString(), p.fechaLimite.toISOString(),
            p.config.horas || null, p.config.dias || null,
            p.config.diasHabiles, 'activo',
          ]
        )
        insertados.push(row)
      }

      return NextResponse.json({ data: insertados }, { status: 201 })
    }

    // Plazo manual
    const parsed = plazoManualSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data
    let fechaLimite: Date

    // Buscar en motor legal del país correspondiente
    const paisExp = (owns.pais || 'MX') as PaisCode
    const motorConfig = paisExp === 'PE'
      ? PLAZOS_NCPP[d.tipoPlazo]
      : PLAZOS_CNPP[d.tipoPlazo]
    const cnppConfig = motorConfig // mantener compatibilidad
    if (motorConfig) {
      fechaLimite = calcularFechaLimite(new Date(d.fechaInicio), motorConfig)
    } else {
      // Plazo custom: calcular manualmente
      const inicio = new Date(d.fechaInicio)
      if (d.horas) {
        fechaLimite = new Date(inicio.getTime() + d.horas * 60 * 60 * 1000)
      } else if (d.dias) {
        fechaLimite = calcularFechaLimite(inicio, {
          tipo: 'custom',
          nombre: d.tipoPlazo,
          fundamentoLegal: d.fundamentoLegal || '',
          dias: d.dias,
          diasHabiles: d.diasHabiles,
          descripcion: d.descripcion || '',
        })
      } else {
        return NextResponse.json({ error: 'Se requiere horas o dias' }, { status: 400 })
      }
    }

    const plazo = await queryOne(
      `INSERT INTO plazos (
        expediente_id, tipo_plazo, fundamento_legal, descripcion,
        fecha_inicio, fecha_limite, horas_totales, dias_totales, dias_habiles, estado, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        id, d.tipoPlazo, d.fundamentoLegal || cnppConfig?.fundamentoLegal || null,
        d.descripcion || cnppConfig?.descripcion || null,
        d.fechaInicio, fechaLimite.toISOString(),
        d.horas || cnppConfig?.horas || null, d.dias || cnppConfig?.dias || null,
        d.diasHabiles, 'activo', d.notas || null,
      ]
    )

    return NextResponse.json({ data: plazo }, { status: 201 })
  } catch (error) {
    console.error('POST plazo error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
