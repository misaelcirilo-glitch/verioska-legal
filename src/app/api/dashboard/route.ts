import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const uid = session.userId

  const [expedientesR, plazosR, audienciasR, cumplidosR, plazosUrgentes, proximasAudiencias] = await Promise.all([
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM expedientes WHERE (user_id = $1 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $1)) AND estado = 'activo'",
      [uid]
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM plazos p JOIN expedientes e ON p.expediente_id = e.id WHERE (e.user_id = $1 OR e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1)) AND p.estado IN ('critico', 'proximo')",
      [uid]
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM audiencias a JOIN expedientes e ON a.expediente_id = e.id WHERE (e.user_id = $1 OR e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1)) AND a.estado = 'programada' AND a.fecha_programada BETWEEN NOW() AND NOW() + INTERVAL '7 days'",
      [uid]
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM plazos p JOIN expedientes e ON p.expediente_id = e.id WHERE (e.user_id = $1 OR e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1)) AND p.estado = 'cumplido'",
      [uid]
    ),
    query(
      `SELECT p.id, p.tipo_plazo, p.fundamento_legal, p.fecha_limite, p.estado, e.delito, e.nuc
       FROM plazos p JOIN expedientes e ON p.expediente_id = e.id
       WHERE (e.user_id = $1 OR e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1))
         AND p.estado IN ('activo', 'proximo', 'critico')
       ORDER BY p.fecha_limite ASC LIMIT 5`,
      [uid]
    ),
    query(
      `SELECT a.id, a.tipo_audiencia, a.fecha_programada, a.sala, a.juzgado, e.delito, e.nuc
       FROM audiencias a JOIN expedientes e ON a.expediente_id = e.id
       WHERE (e.user_id = $1 OR e.despacho_id = (SELECT despacho_id FROM users WHERE id = $1))
         AND a.estado = 'programada' AND a.fecha_programada >= NOW()
       ORDER BY a.fecha_programada ASC LIMIT 5`,
      [uid]
    ),
  ])

  return NextResponse.json({
    data: {
      stats: {
        expedientes: parseInt(expedientesR[0]?.count || '0'),
        plazosCriticos: parseInt(plazosR[0]?.count || '0'),
        audienciasSemana: parseInt(audienciasR[0]?.count || '0'),
        plazosCumplidos: parseInt(cumplidosR[0]?.count || '0'),
      },
      plazosUrgentes,
      proximasAudiencias,
    },
  })
}
