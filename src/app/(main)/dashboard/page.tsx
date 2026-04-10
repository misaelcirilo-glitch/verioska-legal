'use client'

import { useEffect, useState } from 'react'
import { FolderOpen, AlertTriangle, Calendar, CheckCircle } from 'lucide-react'
import { SemaforoPlazo } from '@/shared/components/semaforo-plazo'

interface Stats {
  expedientes: number
  plazosCriticos: number
  audienciasSemana: number
  plazosCumplidos: number
}

interface Plazo {
  id: string; tipo_plazo: string; fundamento_legal: string
  fecha_limite: string; estado: string; delito: string; nuc: string | null
}

interface Audiencia {
  id: string; tipo_audiencia: string; fecha_programada: string
  sala: string | null; juzgado: string | null; delito: string; nuc: string | null
}

const TIPO_AUDIENCIA: Record<string, string> = {
  control_detencion: 'Control de Detención', formulacion_imputacion: 'Formulación de Imputación',
  vinculacion_proceso: 'Vinculación a Proceso', medidas_cautelares: 'Medidas Cautelares',
  plazo_cierre_investigacion: 'Cierre de Investigación', intermedia: 'Intermedia',
  juicio_oral: 'Juicio Oral', individualizacion_sancion: 'Individualización de Sanción',
  amparo: 'Amparo', apelacion: 'Apelación', otra: 'Otra',
  prision_preventiva: 'Prisión Preventiva', tutela_derechos: 'Tutela de Derechos',
  control_plazo: 'Control de Plazo', terminacion_anticipada: 'Terminación Anticipada',
  control_acusacion: 'Control de Acusación', lectura_sentencia: 'Lectura de Sentencia',
}

const STAT_CARDS = [
  { key: 'expedientes', title: 'Expedientes Activos', icon: FolderOpen, color: 'blue' },
  { key: 'plazosCriticos', title: 'Plazos Críticos', icon: AlertTriangle, color: 'red' },
  { key: 'audienciasSemana', title: 'Audiencias esta Semana', icon: Calendar, color: 'amber' },
  { key: 'plazosCumplidos', title: 'Plazos Cumplidos', icon: CheckCircle, color: 'green' },
] as const

const COLOR_MAP: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'bg-white', text: 'text-blue-700', iconBg: 'bg-blue-50 text-blue-600' },
  red: { bg: 'bg-white', text: 'text-red-700', iconBg: 'bg-red-50 text-red-600' },
  amber: { bg: 'bg-white', text: 'text-amber-700', iconBg: 'bg-amber-50 text-amber-600' },
  green: { bg: 'bg-white', text: 'text-green-700', iconBg: 'bg-green-50 text-green-600' },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [plazos, setPlazos] = useState<Plazo[]>([])
  const [audiencias, setAudiencias] = useState<Audiencia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setStats(d.data?.stats || { expedientes: 0, plazosCriticos: 0, audienciasSemana: 0, plazosCumplidos: 0 })
        setPlazos(d.data?.plazosUrgentes || [])
        setAudiencias(d.data?.proximasAudiencias || [])
      })
      .catch(() => setStats({ expedientes: 0, plazosCriticos: 0, audienciasSemana: 0, plazosCumplidos: 0 }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Centro de Mando</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(card => {
          const c = COLOR_MAP[card.color]
          return (
            <div key={card.key} className={`rounded-xl border border-slate-200 ${c.bg} p-5 shadow-sm`}>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-3 w-24 rounded bg-slate-200 mb-3" />
                  <div className="h-8 w-12 rounded bg-slate-200" />
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</p>
                    <p className={`mt-2 text-3xl font-bold ${c.text}`}>{stats?.[card.key] ?? 0}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${c.iconBg}`}>
                    <card.icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Plazos */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <AlertTriangle className="h-5 w-5 text-red-500" /> Plazos Urgentes
          </h2>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-slate-100" />)}
            </div>
          ) : plazos.length === 0 ? (
            <p className="text-sm text-slate-500">No hay plazos urgentes. Todo en orden.</p>
          ) : (
            <div className="space-y-3">
              {plazos.map(p => (
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

        {/* Audiencias */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Calendar className="h-5 w-5 text-blue-500" /> Próximas Audiencias
          </h2>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-slate-100" />)}
            </div>
          ) : audiencias.length === 0 ? (
            <p className="text-sm text-slate-500">No hay audiencias programadas.</p>
          ) : (
            <div className="space-y-3">
              {audiencias.map(a => (
                <div key={a.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{TIPO_AUDIENCIA[a.tipo_audiencia] || a.tipo_audiencia}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{a.nuc || a.delito}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {new Date(a.fecha_programada).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(a.fecha_programada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {a.juzgado && <p className="mt-2 text-xs text-slate-400">{a.juzgado} {a.sala ? `· Sala ${a.sala}` : ''}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
