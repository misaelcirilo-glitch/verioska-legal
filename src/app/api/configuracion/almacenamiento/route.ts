import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

const STORAGE_LIMIT_BYTES = 100 * 1024 * 1024 * 1024 // 100 GB plan Pro

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Total bytes y conteo de documentos del despacho via expedientes
  const stats = await queryOne<{ total_bytes: string; total_count: string }>(
    `SELECT
       COALESCE(SUM(d.tamano_bytes), 0)::text as total_bytes,
       COUNT(d.id)::text as total_count
     FROM documentos d
     JOIN expedientes e ON e.id = d.expediente_id
     WHERE e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1)`,
    [session.userId]
  )

  // Top 10 archivos más pesados
  const top = await query(
    `SELECT d.id, d.nombre_archivo, d.tamano_bytes, d.tipo_archivo, d.created_at,
            e.numero_expediente
     FROM documentos d
     JOIN expedientes e ON e.id = d.expediente_id
     WHERE e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1)
     ORDER BY d.tamano_bytes DESC NULLS LAST
     LIMIT 10`,
    [session.userId]
  )

  const usedBytes = Number(stats?.total_bytes || 0)
  const totalCount = Number(stats?.total_count || 0)
  const percent = Math.round((usedBytes / STORAGE_LIMIT_BYTES) * 100 * 100) / 100

  return NextResponse.json({
    data: {
      used_bytes: usedBytes,
      limit_bytes: STORAGE_LIMIT_BYTES,
      percent,
      total_files: totalCount,
      top_files: top,
    }
  })
}
