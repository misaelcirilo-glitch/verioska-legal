import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne, resolveDespachoId } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function verifyOwnership(expedienteId: string, userId: string) {
  // Tenancy alineada al listado/detalle: el dueño O cualquier colega del mismo
  // despacho. Antes filtraba solo por user_id → un colega veía el expediente en
  // la lista pero recibía 404 al registrar gastos (mismo patrón de auto-blindaje
  // ya corregido en expedientes/[id] y dosificación).
  return queryOne<{ id: string; despacho_id: string | null }>(
    `SELECT id, despacho_id FROM expedientes
      WHERE id = $1
        AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
    [expedienteId, userId]
  )
}

const gastoSchema = z.object({
  concepto: z.string().min(1, 'Concepto requerido'),
  categoria: z.enum(['peritaje', 'copias', 'movilidad', 'tasa_judicial', 'notarial', 'otros']).optional(),
  monto: z.number().positive('Monto debe ser positivo'),
  moneda: z.enum(['PEN', 'MXN', 'USD']).default('PEN'),
  fechaGasto: z.string().optional(),
  comprobante: z.string().optional(),
  notas: z.string().optional(),
})

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

    const gastos = await query(
      'SELECT * FROM gastos WHERE expediente_id = $1 ORDER BY fecha_gasto DESC',
      [id]
    )

    // También calcular totales
    const totales = await queryOne<{ total: string; count: string }>(
      'SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as count FROM gastos WHERE expediente_id = $1',
      [id]
    )

    return NextResponse.json({
      data: gastos,
      totales: {
        total: parseFloat(totales?.total || '0'),
        count: parseInt(totales?.count || '0'),
      },
    })
  } catch (error) {
    console.error('GET gastos error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

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
    const parsed = gastoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    // Se guarda el despacho_id cuando puede resolverse (metadato); si el layer
    // de despachos no está poblado queda NULL (columna nullable desde mig. 005).
    const despachoId = expediente.despacho_id ?? session.despachoId ?? (await resolveDespachoId(session.userId))

    const gasto = await queryOne(
      `INSERT INTO gastos (
        despacho_id, expediente_id, concepto, categoria,
        monto, moneda, fecha_gasto, comprobante, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        despachoId, id, d.concepto, d.categoria || null,
        d.monto, d.moneda, d.fechaGasto || new Date().toISOString(),
        d.comprobante || null, d.notas || null,
      ]
    )

    return NextResponse.json({ data: gasto }, { status: 201 })
  } catch (error) {
    console.error('POST gasto error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
