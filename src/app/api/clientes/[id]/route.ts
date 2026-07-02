import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Permisos (PRP-005): editar/archivar → admin/abogado; borrado permanente → admin.
const EDIT_ROLES = ['admin', 'abogado']

const clienteUpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellidos: z.string().nullable().optional(),
  tipoDocumento: z.enum(['dni', 'ce', 'pasaporte', 'ine', 'curp', 'ruc', 'rfc']).nullable().optional(),
  numeroDocumento: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  direccion: z.string().nullable().optional(),
  estado: z.enum(['prospecto', 'activo', 'inactivo', 'archivado']).optional(),
  fuente: z.enum(['referido', 'web', 'redes_sociales', 'directorio', 'otro']).nullable().optional(),
  notas: z.string().nullable().optional(),
})

const CLIENTE_FIELDS: Record<string, string> = {
  nombre: 'nombre',
  apellidos: 'apellidos',
  tipoDocumento: 'tipo_documento',
  numeroDocumento: 'numero_documento',
  telefono: 'telefono',
  email: 'email',
  direccion: 'direccion',
  estado: 'estado',
  fuente: 'fuente',
  notas: 'notas',
}

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (!EDIT_ROLES.includes(session.rol)) {
      return NextResponse.json({ error: 'No tienes permiso para editar clientes' }, { status: 403 })
    }

    const { id } = await params

    // Scoping por despacho del usuario
    const owns = await queryOne<{ id: string }>(
      'SELECT id FROM clientes WHERE id = $1 AND despacho_id = (SELECT despacho_id FROM users WHERE id = $2)',
      [id, session.userId]
    )
    if (!owns) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const parsed = clienteUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const body = parsed.data as Record<string, unknown>
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1
    for (const [camel, snake] of Object.entries(CLIENTE_FIELDS)) {
      if (camel in body) {
        fields.push(`${snake} = $${idx}`)
        values.push(body[camel] === '' ? null : body[camel])
        idx++
      }
    }
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }
    fields.push('updated_at = NOW()')
    values.push(id)

    const updated = await queryOne(
      `UPDATE clientes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('PUT cliente error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    // Borrado permanente: solo admin (decisión PRP-005). Archivar se hace vía PUT estado='archivado'.
    if (session.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo un administrador puede eliminar permanentemente' }, { status: 403 })
    }

    const { id } = await params
    const owns = await queryOne<{ id: string }>(
      'SELECT id FROM clientes WHERE id = $1 AND despacho_id = (SELECT despacho_id FROM users WHERE id = $2)',
      [id, session.userId]
    )
    if (!owns) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    // Si el cliente tiene expedientes, no borramos físico: se desvincula y archiva.
    const conExp = await queryOne<{ n: string }>(
      'SELECT COUNT(*)::text AS n FROM expedientes WHERE cliente_id = $1',
      [id]
    )
    if (Number(conExp?.n || 0) > 0) {
      await queryOne("UPDATE clientes SET estado = 'archivado', updated_at = NOW() WHERE id = $1", [id])
      return NextResponse.json({ data: { ok: true, archived: true } })
    }

    await queryOne('DELETE FROM clientes WHERE id = $1', [id])
    return NextResponse.json({ data: { ok: true } })
  } catch (error) {
    console.error('DELETE cliente error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
