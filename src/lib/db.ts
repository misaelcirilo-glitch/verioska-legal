import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows as T[]
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params)
  return (result.rows[0] as T) ?? null
}

/**
 * Resuelve el despacho_id del usuario. Se usa como fallback defensivo cuando
 * un registro (p. ej. un expediente antiguo) tiene despacho_id NULL, evitando
 * violar el NOT NULL de gastos/pagos.
 */
export async function resolveDespachoId(userId: string): Promise<string | null> {
  const row = await queryOne<{ despacho_id: string | null }>(
    'SELECT despacho_id FROM users WHERE id = $1',
    [userId]
  )
  return row?.despacho_id ?? null
}

export { pool }
