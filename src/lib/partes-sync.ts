import { query, queryOne } from '@/lib/db'

/**
 * Marca una parte como el CLIENTE PRINCIPAL del expediente y sincroniza el CRM
 * (sync inversa Parte → Cliente). Comportamiento compartido por el POST (al
 * registrar la parte) y el PATCH (al editarla):
 *
 * - Si la parte no tiene cliente vinculado y hay despacho, crea el cliente en el
 *   directorio (`fuente = 'directorio'`) y lo enlaza (`partes.cliente_id`).
 * - Garantiza un ÚNICO principal por expediente (desmarca los demás).
 * - Apunta `expedientes.cliente_id` al cliente vinculado.
 *
 * Devuelve el `cliente_id` vinculado (o null si no se pudo crear/enlazar).
 */
export async function marcarPartePrincipal(params: {
  expedienteId: string
  parteId: string
  despachoId: string | null
  clienteIdActual: string | null
  nombre: string
  apellidos: string | null
}): Promise<string | null> {
  const { expedienteId, parteId, despachoId, clienteIdActual, nombre, apellidos } = params
  let clienteVinculado = clienteIdActual

  // Parte registrada manualmente (sin cliente): la damos de alta en el CRM.
  if (!clienteVinculado && despachoId) {
    const nuevoCliente = await queryOne<{ id: string }>(
      `INSERT INTO clientes (despacho_id, nombre, apellidos, estado, fuente)
       VALUES ($1, $2, $3, 'activo', 'directorio') RETURNING id`,
      [despachoId, nombre, apellidos || null]
    )
    clienteVinculado = nuevoCliente?.id ?? null
    if (clienteVinculado) {
      await query('UPDATE partes SET cliente_id = $1 WHERE id = $2', [clienteVinculado, parteId])
    }
  }

  // Un único principal por expediente.
  await query('UPDATE partes SET es_principal = false WHERE expediente_id = $1 AND id <> $2', [expedienteId, parteId])
  await query('UPDATE partes SET es_principal = true, updated_at = NOW() WHERE id = $1', [parteId])

  if (clienteVinculado) {
    await query('UPDATE expedientes SET cliente_id = $1, updated_at = NOW() WHERE id = $2', [clienteVinculado, expedienteId])
  }
  return clienteVinculado
}

/**
 * Desmarca una parte como principal y, si el expediente apuntaba a su cliente,
 * lo desvincula (no borra el cliente del CRM).
 */
export async function desmarcarPartePrincipal(params: {
  expedienteId: string
  parteId: string
  clienteId: string | null
}): Promise<void> {
  const { expedienteId, parteId, clienteId } = params
  await query('UPDATE partes SET es_principal = false, updated_at = NOW() WHERE id = $1', [parteId])
  if (clienteId) {
    await query(
      'UPDATE expedientes SET cliente_id = NULL, updated_at = NOW() WHERE id = $1 AND cliente_id = $2',
      [expedienteId, clienteId]
    )
  }
}
