import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FolderOpen, AlertTriangle, Calendar, CheckCircle } from 'lucide-react'
import { StatCard } from '@/shared/components/stat-card'
import { SemaforoPlazo } from '@/shared/components/semaforo-plazo'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [expedientesResult, plazosResult, audienciasResult, cumplidos] = await Promise.all([
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM expedientes WHERE user_id = $1 AND estado = 'activo'",
      [session.userId]
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM plazos p JOIN expedientes e ON p.expediente_id = e.id WHERE e.user_id = $1 AND p.estado IN ('critico', 'proximo')",
      [session.userId]
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM audiencias a JOIN expedientes e ON a.expediente_id = e.id WHERE e.user_id = $1 AND a.estado = 'programada' AND a.fecha_programada BETWEEN NOW() AND NOW() + INTERVAL '7 days'",
      [session.userId]
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) as count FROM plazos p JOIN expedientes e ON p.expediente_id = e.id WHERE e.user_id = $1 AND p.estado = 'cumplido'",
      [session.userId]
    ),
  ])

  const stats = {
    expedientes: parseInt(expedientesResult[0]?.count || '0'),
    plazosCriticos: parseInt(plazosResult[0]?.count || '0'),
    audienciasSemana: parseInt(audienciasResult[0]?.count || '0'),
    plazosCumplidos: parseInt(cumplidos[0]?.count || '0'),
  }

  const plazosUrgentes = await query<{
    id: string; tipo_plazo: string; fundamento_legal: string
    fecha_limite: string; estado: string; horas_totales: number | null
    dias_totales: number | null; delito: string; nuc: string | null
  }>(
    `SELECT p.id, p.tipo_plazo, p.fundamento_legal, p.fecha_limite, p.estado,
            p.horas_totales, p.dias_totales, e.delito, e.nuc
     FROM plazos p JOIN expedientes e ON p.expediente_id = e.id
     WHERE e.user_id = $1 AND p.estado IN ('activo', 'proximo', 'critico')
     ORDER BY p.fecha_limite ASC LIMIT 5`,
    [session.userId]
  )

  const proximasAudiencias = await query<{
    id: string; tipo_audiencia: string; fecha_programada: string
    sala: string | null; juzgado: string | null; delito: string; nuc: string | null
  }>(
    `SELECT a.id, a.tipo_audiencia, a.fecha_programada, a.sala, a.juzgado, e.delito, e.nuc
     FROM audiencias a JOIN expedientes e ON a.expediente_id = e.id
     WHERE e.user_id = $1 AND a.estado = 'programada' AND a.fecha_programada >= NOW()
     ORDER BY a.fecha_programada ASC LIMIT 5`,
    [session.userId]
  )

  const tipoAudienciaLabels: Record<string, string> = {
    control_detencion: 'Control de Detención', formulacion_imputacion: 'Formulación de Imputación',
    vinculacion_proceso: 'Vinculación a Proceso', medidas_cautelares: 'Medidas Cautelares',
    plazo_cierre_investigacion: 'Cierre de Investigación', intermedia: 'Intermedia',
    juicio_oral: 'Juicio Oral', individualizacion_sancion: 'Individualización de Sanción',
    amparo: 'Amparo', apelacion: 'Apelación', otra: 'Otra',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Centro de Mando</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Expedientes Activos" value={stats.expedientes} icon={FolderOpen} color="blue" />
        <StatCard title="Plazos Críticos" value={stats.plazosCriticos} icon={AlertTriangle} color="red" />
        <StatCard title="Audiencias esta Semana" value={stats.audienciasSemana} icon={Calendar} color="yellow" />
        <StatCard title="Plazos Cumplidos" value={stats.plazosCumplidos} icon={CheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Plazos Urgentes */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Plazos Urgentes
          </h2>
          {plazosUrgentes.length === 0 ? (
            <p className="text-sm text-slate-500">No hay plazos urgentes. Todo en orden.</p>
          ) : (
            <div className="space-y-3">
              {plazosUrgentes.map(p => (
                <SemaforoPlazo
                  key={p.id}
                  estado={p.estado as 'activo' | 'proximo' | 'critico'}
                  fechaLimite={p.fecha_limite}
                  nombre={`${p.nuc || p.delito} — ${p.tipo_plazo.replace(/_/g, ' ')}`}
                  fundamentoLegal={p.fundamento_legal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Próximas Audiencias */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Calendar className="h-5 w-5 text-blue-500" />
            Próximas Audiencias
          </h2>
          {proximasAudiencias.length === 0 ? (
            <p className="text-sm text-slate-500">No hay audiencias programadas.</p>
          ) : (
            <div className="space-y-3">
              {proximasAudiencias.map(a => (
                <div key={a.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {tipoAudienciaLabels[a.tipo_audiencia] || a.tipo_audiencia}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">{a.nuc || a.delito}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {new Date(a.fecha_programada).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(a.fecha_programada).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {a.juzgado && (
                    <p className="mt-2 text-xs text-slate-400">{a.juzgado} {a.sala ? `· Sala ${a.sala}` : ''}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
