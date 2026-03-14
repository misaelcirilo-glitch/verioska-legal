import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import Link from 'next/link'

const tipoLabels: Record<string, string> = {
  control_detencion: 'Control de Detención',
  formulacion_imputacion: 'Formulación de Imputación',
  vinculacion_proceso: 'Vinculación a Proceso',
  medidas_cautelares: 'Medidas Cautelares',
  plazo_cierre_investigacion: 'Cierre de Investigación',
  intermedia: 'Intermedia',
  juicio_oral: 'Juicio Oral',
  individualizacion_sancion: 'Individualización de Sanción',
  amparo: 'Amparo',
  apelacion: 'Apelación',
  otra: 'Otra',
}

const estadoBadge: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
  programada: 'info',
  realizada: 'success',
  diferida: 'warning',
  cancelada: 'neutral',
  suspendida: 'warning',
}

export default async function AudienciasPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const audiencias = await query<{
    id: string
    expediente_id: string
    tipo_audiencia: string
    fecha_programada: string
    sala: string | null
    juzgado: string | null
    juez: string | null
    estado: string
    resultado: string | null
    delito: string
    nuc: string | null
  }>(
    `SELECT a.*, e.delito, e.nuc
     FROM audiencias a
     JOIN expedientes e ON a.expediente_id = e.id
     WHERE e.user_id = $1
     ORDER BY a.fecha_programada ASC`,
    [session.userId]
  )

  const proximas = audiencias.filter(a => a.estado === 'programada' && new Date(a.fecha_programada) >= new Date())
  const pasadas = audiencias.filter(a => a.estado !== 'programada' || new Date(a.fecha_programada) < new Date())

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-7 w-7 text-blue-500" /> Audiencias
        </h1>
        <p className="text-sm text-slate-500">{proximas.length} próxima(s) · {pasadas.length} pasada(s)</p>
      </div>

      {proximas.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Próximas Audiencias</h2>
          <div className="space-y-3">
            {proximas.map(a => (
              <Link
                key={a.id}
                href={`/expedientes/${a.expediente_id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{tipoLabels[a.tipo_audiencia]}</p>
                    <p className="text-sm text-slate-500">{a.nuc || a.delito}</p>
                    {a.juzgado && <p className="text-xs text-slate-400">{a.juzgado} {a.sala ? `• Sala ${a.sala}` : ''}</p>}
                    {a.juez && <p className="text-xs text-slate-400">Juez: {a.juez}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {new Date(a.fecha_programada).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(a.fecha_programada).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <Badge variant={estadoBadge[a.estado] || 'neutral'}>{a.estado}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pasadas.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-600">Historial</h2>
          <div className="space-y-2">
            {pasadas.map(a => (
              <div key={a.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-600">{tipoLabels[a.tipo_audiencia]}</p>
                    <p className="text-xs text-slate-500">{a.nuc || a.delito}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{new Date(a.fecha_programada).toLocaleDateString('es-MX')}</p>
                    <Badge variant={estadoBadge[a.estado] || 'neutral'}>{a.estado}</Badge>
                  </div>
                </div>
                {a.resultado && <p className="mt-2 text-sm text-slate-600 border-t pt-2">{a.resultado}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {audiencias.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white py-16">
          <Calendar className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Sin audiencias registradas</p>
          <p className="mt-1 text-sm text-slate-400">Las audiencias se registran desde cada expediente</p>
        </div>
      )}
    </div>
  )
}
