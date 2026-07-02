import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Permisos (PRP-005): editar/eliminar partes → admin/abogado.
const EDIT_ROLES = ['admin', 'abogado']

// Scoping por despacho (coherente con el listado y el detalle del expediente).
async function verifyExpedienteAccess(expedienteId: string, userId: string) {
  return queryOne<{ id: string; despacho_id: string | null }>(
    `SELECT id, despacho_id FROM expedientes
      WHERE id = $1
        AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
    [expedienteId, userId]
  )
}

const parteUpdateSchema = z.object({
  tipo: z.enum([
    'imputado', 'victima', 'testigo', 'perito',
    'ministerio_publico', 'defensor', 'asesor_juridico', 'juez', 'policia',
    'demandante', 'demandado', 'denunciante', 'agraviado',
  ]).optional(),
  nombre: z.string().min(1).optional(),
  apellidos: z.string().nullable().optional(),
  alias: z.string().nullable().optional(),
  edad: z.number().int().positive().nullable().optional(),
  genero: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
  esPrincipal: z.boolean().optional(),
})

const PARTE_FIELDS: Record<string, string> = {
  tipo: 'tipo',
  nombre: 'nombre',
  apellidos: 'apellidos',
  alias: 'alias',
  edad: 'edad',
  genero: 'genero',
  notas: 'notas',
}

interface ParteRow {
  id: string
  expediente_id: string
  nombre: string
  apellidos: string | null
  cliente_id: string | null
  es_principal: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; parteId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (!EDIT_ROLES.includes(session.rol)) {
      return NextResponse.json({ error: 'No tienes permiso para editar partes' }, { status: 403 })
    }

    const { id, parteId } = await params
    const exp = await verifyExpedienteAccess(id, session.userId)
    if (!exp) return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })

    const parte = await queryOne<ParteRow>(
      'SELECT * FROM partes WHERE id = $1 AND expediente_id = $2',
      [parteId, id]
    )
    if (!parte) return NextResponse.json({ error: 'Parte no encontrada' }, { status: 404 })

    const parsed = parteUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const body = parsed.data as Record<string, unknown>

    // 1. Actualizar campos simples de la parte
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1
    for (const [camel, snake] of Object.entries(PARTE_FIELDS)) {
      if (camel in body) {
        fields.push(`${snake} = $${idx}`)
        values.push(body[camel])
        idx++
      }
    }
    if (fields.length > 0) {
      fields.push('updated_at = NOW()')
      values.push(parteId)
      await query(`UPDATE partes SET ${fields.join(', ')} WHERE id = $${idx}`, values)
    }

    // 2. Sync inversa: marcar/desmarcar como cliente principal del expediente
    let clienteVinculado: string | null = parte.cliente_id
    if ('esPrincipal' in body) {
      if (body.esPrincipal === true) {
        // Si la parte no tiene cliente (fue registrada manual), lo creamos en el CRM.
        if (!parte.cliente_id && exp.despacho_id) {
          const nombre = (body.nombre as string) ?? parte.nombre
          const apellidos = (body.apellidos as string | null | undefined) ?? parte.apellidos
          const nuevoCliente = await queryOne<{ id: string }>(
            `INSERT INTO clientes (despacho_id, nombre, apellidos, estado, fuente)
             VALUES ($1, $2, $3, 'activo', 'directorio') RETURNING id`,
            [exp.despacho_id, nombre, apellidos || null]
          )
          clienteVinculado = nuevoCliente?.id ?? null
          if (clienteVinculado) {
            await query('UPDATE partes SET cliente_id = $1 WHERE id = $2', [clienteVinculado, parteId])
          }
        }
        // Un único principal por expediente
        await query('UPDATE partes SET es_principal = false WHERE expediente_id = $1 AND id <> $2', [id, parteId])
        await query('UPDATE partes SET es_principal = true, updated_at = NOW() WHERE id = $1', [parteId])
        if (clienteVinculado) {
          await query('UPDATE expedientes SET cliente_id = $1, updated_at = NOW() WHERE id = $2', [clienteVinculado, id])
        }
      } else {
        // Desmarcar: quitar el flag y, si el expediente apuntaba a este cliente, desvincular.
        await query('UPDATE partes SET es_principal = false, updated_at = NOW() WHERE id = $1', [parteId])
        if (parte.cliente_id) {
          await query('UPDATE expedientes SET cliente_id = NULL, updated_at = NOW() WHERE id = $1 AND cliente_id = $2', [id, parte.cliente_id])
        }
      }
    }

    const actualizada = await queryOne(
      `SELECT p.*, c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos
         FROM partes p LEFT JOIN clientes c ON c.id = p.cliente_id
        WHERE p.id = $1`,
      [parteId]
    )
    return NextResponse.json({ data: actualizada })
  } catch (error) {
    console.error('PATCH parte error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; parteId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (!EDIT_ROLES.includes(session.rol)) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar partes' }, { status: 403 })
    }

    const { id, parteId } = await params
    const exp = await verifyExpedienteAccess(id, session.userId)
    if (!exp) return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })

    const parte = await queryOne<ParteRow>(
      'SELECT * FROM partes WHERE id = $1 AND expediente_id = $2',
      [parteId, id]
    )
    if (!parte) return NextResponse.json({ error: 'Parte no encontrada' }, { status: 404 })

    // Si era la parte principal, desvincular el cliente del expediente (no borra el cliente del CRM).
    if (parte.es_principal && parte.cliente_id) {
      await query('UPDATE expedientes SET cliente_id = NULL, updated_at = NOW() WHERE id = $1 AND cliente_id = $2', [id, parte.cliente_id])
    }

    await query('DELETE FROM partes WHERE id = $1', [parteId])
    return NextResponse.json({ data: { ok: true } })
  } catch (error) {
    console.error('DELETE parte error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
