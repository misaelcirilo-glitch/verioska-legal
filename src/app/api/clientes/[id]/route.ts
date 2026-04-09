import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

interface ClienteRow {
  id: string
  despacho_id: string
  nombre: string
  apellidos: string | null
  tipo_documento: string | null
  numero_documento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  estado: string
  fuente: string | null
  notas: string | null
  created_at: string
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { id } = await params

    const cliente = await queryOne<ClienteRow>(
      `SELECT c.* FROM clientes c
       WHERE c.id = $1
         AND c.despacho_id = (SELECT despacho_id FROM users WHERE id = $2)`,
      [id, session.userId]
    )

    if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    // Expedientes del cliente
    const expedientes = await query(
      `SELECT e.id, e.numero_carpeta_fiscal, e.numero_expediente_judicial, e.delito,
              e.etapa_procesal, e.juzgado, e.fiscalia, e.estado, e.created_at,
              COALESCE((SELECT SUM(g.monto) FROM gastos g WHERE g.expediente_id = e.id), 0) as gastos_total
       FROM expedientes e
       WHERE e.cliente_id = $1
       ORDER BY e.created_at DESC`,
      [id]
    )

    // Pagos del cliente
    const pagos = await query(
      `SELECT p.id, p.monto, p.moneda, p.concepto, p.estado, p.metodo_pago,
              p.fecha_vencimiento, p.fecha_pago, p.created_at,
              e.numero_carpeta_fiscal, e.numero_expediente_judicial
       FROM pagos p
       LEFT JOIN expedientes e ON e.id = p.expediente_id
       WHERE p.cliente_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    )

    // Stats
    const stats = await queryOne<{ total_facturado: string; total_pagado: string; pendiente: string }>(
      `SELECT
         COALESCE(SUM(monto), 0)::text as total_facturado,
         COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0)::text as total_pagado,
         COALESCE(SUM(CASE WHEN estado != 'pagado' THEN monto ELSE 0 END), 0)::text as pendiente
       FROM pagos WHERE cliente_id = $1`,
      [id]
    )

    return NextResponse.json({
      data: {
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          apellidos: cliente.apellidos,
          tipoDocumento: cliente.tipo_documento,
          numeroDocumento: cliente.numero_documento,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion,
          estado: cliente.estado,
          fuente: cliente.fuente,
          notas: cliente.notas,
          createdAt: cliente.created_at,
        },
        expedientes,
        pagos,
        stats: {
          totalFacturado: Number(stats?.total_facturado || 0),
          totalPagado: Number(stats?.total_pagado || 0),
          pendiente: Number(stats?.pendiente || 0),
        },
      },
    })
  } catch (error) {
    console.error('GET cliente detalle error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
