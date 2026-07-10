import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne, resolveDespachoId } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function verifyOwnership(expedienteId: string, userId: string) {
  // Tenancy alineada al listado/detalle: el dueño O cualquier colega del mismo
  // despacho. Antes filtraba solo por user_id → un colega veía el expediente en
  // la lista pero recibía 404 al registrar pagos (mismo patrón de auto-blindaje
  // ya corregido en expedientes/[id] y dosificación).
  return queryOne<{ id: string; despacho_id: string | null; cliente_id: string | null }>(
    `SELECT id, despacho_id, cliente_id FROM expedientes
      WHERE id = $1
        AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
    [expedienteId, userId]
  )
}

const pagoSchema = z.object({
  monto: z.number().positive('Monto debe ser positivo'),
  moneda: z.enum(['PEN', 'MXN', 'USD']).default('PEN'),
  concepto: z.string().min(1, 'Concepto requerido'),
  etapaProcesal: z.string().optional(),
  metodoPago: z.enum(['efectivo', 'transferencia', 'deposito', 'cheque', 'yape', 'plin', 'tarjeta', 'otro']).optional(),
  estado: z.enum(['pendiente', 'pagado', 'parcial', 'vencido', 'cancelado']).default('pendiente'),
  fechaVencimiento: z.string().optional(),
  fechaPago: z.string().optional(),
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

    const pagos = await query(
      'SELECT * FROM pagos WHERE expediente_id = $1 ORDER BY created_at DESC',
      [id]
    )

    return NextResponse.json({ data: pagos })
  } catch (error) {
    console.error('GET pagos error:', error)
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
    const parsed = pagoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data

    // despacho_id como metadato (nullable desde mig. 005); se guarda si se puede.
    const despachoId = expediente.despacho_id ?? session.despachoId ?? (await resolveDespachoId(session.userId))

    // cliente_id ahora es opcional (migración 005): un pago puede registrarse
    // aunque el expediente todavía no tenga cliente asignado.
    const pago = await queryOne(
      `INSERT INTO pagos (
        despacho_id, expediente_id, cliente_id,
        monto, moneda, concepto, etapa_procesal,
        metodo_pago, estado, fecha_vencimiento, fecha_pago,
        comprobante, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        despachoId, id, expediente.cliente_id ?? null,
        d.monto, d.moneda, d.concepto, d.etapaProcesal || null,
        d.metodoPago || null, d.estado,
        d.fechaVencimiento || null, d.fechaPago || null,
        d.comprobante || null, d.notas || null,
      ]
    )

    return NextResponse.json({ data: pago }, { status: 201 })
  } catch (error) {
    console.error('POST pago error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
