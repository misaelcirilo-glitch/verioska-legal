import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Clock } from 'lucide-react'
import { SemaforoPlazo } from '@/shared/components/semaforo-plazo'
import { Badge } from '@/shared/components/badge'

export default async function PlazosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const plazos = await query<{
    id: string
    tipo_plazo: string
    fundamento_legal: string | null
    descripcion: string | null
    fecha_inicio: string
    fecha_limite: string
    estado: string
    horas_totales: number | null
    dias_totales: number | null
    delito: string
    nuc: string | null
    expediente_id: string
  }>(
    `SELECT p.*, e.delito, e.nuc
     FROM plazos p
     JOIN expedientes e ON p.expediente_id = e.id
     WHERE e.user_id = $1
     ORDER BY
       CASE p.estado
         WHEN 'critico' THEN 1
         WHEN 'proximo' THEN 2
         WHEN 'activo' THEN 3
         WHEN 'vencido' THEN 4
         WHEN 'cumplido' THEN 5
         WHEN 'cancelado' THEN 6
       END,
       p.fecha_limite ASC`,
    [session.userId]
  )

  const activos = plazos.filter(p => ['activo', 'proximo', 'critico'].includes(p.estado))
  const vencidos = plazos.filter(p => p.estado === 'vencido')
  const cumplidos = plazos.filter(p => p.estado === 'cumplido')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-7 w-7 text-red-500" /> Control de Plazos
        </h1>
        <p className="text-sm text-slate-500">
          {activos.length} activo(s) · {vencidos.length} vencido(s) · {cumplidos.length} cumplido(s)
        </p>
      </div>

      {activos.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Plazos Activos</h2>
          <div className="space-y-3">
            {activos.map(p => (
              <div key={p.id}>
                <p className="mb-1 text-xs text-slate-500">
                  {p.nuc || p.delito}
                </p>
                <SemaforoPlazo
                  estado={p.estado as 'activo' | 'proximo' | 'critico'}
                  fechaLimite={p.fecha_limite}
                  nombre={p.tipo_plazo.replace(/_/g, ' ')}
                  fundamentoLegal={p.fundamento_legal || undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {vencidos.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-red-700">Plazos Vencidos</h2>
          <div className="space-y-2">
            {vencidos.map(p => (
              <div key={p.id} className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">{p.tipo_plazo.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-red-600">{p.nuc || p.delito}</p>
                  </div>
                  <Badge variant="danger">VENCIDO</Badge>
                </div>
                <p className="mt-1 text-xs text-red-500">
                  Venció: {new Date(p.fecha_limite).toLocaleString('es-MX')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {cumplidos.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-600">Plazos Cumplidos</h2>
          <div className="space-y-2">
            {cumplidos.map(p => (
              <div key={p.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-600">{p.tipo_plazo.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">{p.nuc || p.delito}</p>
                  </div>
                  <Badge variant="success">Cumplido</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {plazos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white py-16">
          <Clock className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Sin plazos registrados</p>
          <p className="mt-1 text-sm text-slate-400">Los plazos se generan automáticamente al crear expedientes con fecha de detención</p>
        </div>
      )}
    </div>
  )
}
