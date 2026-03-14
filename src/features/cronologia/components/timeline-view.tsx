'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, FileText, Scale, AlertTriangle, Loader2 } from 'lucide-react'
import { Badge } from '@/shared/components/badge'

interface EventoCronologia {
  id: string
  fecha: string
  titulo: string
  descripcion: string | null
  tipo: 'hecho' | 'audiencia' | 'plazo' | 'procesal'
  fuente: string
  metadata: Record<string, unknown>
}

const tipoConfig: Record<string, { icon: typeof Calendar; color: string; label: string; badgeVariant: 'info' | 'success' | 'neutral' }> = {
  hecho: { icon: FileText, color: 'text-blue-500 bg-blue-100', label: 'Hecho', badgeVariant: 'info' },
  audiencia: { icon: Scale, color: 'text-purple-500 bg-purple-100', label: 'Audiencia', badgeVariant: 'neutral' },
  plazo: { icon: Clock, color: 'text-red-500 bg-red-100', label: 'Plazo', badgeVariant: 'neutral' },
  procesal: { icon: Calendar, color: 'text-green-500 bg-green-100', label: 'Procesal', badgeVariant: 'success' },
}

interface Props {
  expedienteId: string
}

export function TimelineView({ expedienteId }: Props) {
  const [eventos, setEventos] = useState<EventoCronologia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<string>('todos')

  useEffect(() => {
    async function fetchCronologia() {
      try {
        const res = await fetch(`/api/expedientes/${expedienteId}/cronologia`)
        if (!res.ok) throw new Error('Error al cargar cronología')
        const { data } = await res.json()
        setEventos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchCronologia()
  }, [expedienteId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando cronología...
      </div>
    )
  }

  if (error) {
    return <p className="py-4 text-sm text-red-500">{error}</p>
  }

  const eventosFiltrados = filtro === 'todos'
    ? eventos
    : eventos.filter(e => e.tipo === filtro)

  if (eventos.length === 0) {
    return (
      <div className="py-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">
          Sin eventos en la cronología. Agrega audiencias, plazos o procesa documentos para generar la línea del tiempo.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        {['todos', 'hecho', 'audiencia', 'plazo', 'procesal'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filtro === f
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'todos' ? 'Todos' : tipoConfig[f]?.label || f} ({f === 'todos' ? eventos.length : eventos.filter(e => e.tipo === f).length})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative ml-4 border-l-2 border-slate-200 pl-6">
        {eventosFiltrados.map((evento) => {
          const config = tipoConfig[evento.tipo] || tipoConfig.procesal
          const Icon = config.icon

          return (
            <div key={evento.id} className="relative mb-6 last:mb-0">
              {/* Dot */}
              <div className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ${config.color}`}>
                <Icon className="h-3 w-3" />
              </div>

              {/* Content */}
              <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{evento.titulo}</p>
                    {evento.descripcion && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{evento.descripcion}</p>
                    )}
                  </div>
                  <Badge variant={config.badgeVariant}>{config.label}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{new Date(evento.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>{new Date(evento.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-slate-300">|</span>
                  <span>{evento.fuente}</span>
                  {typeof evento.metadata.estado === 'string' && (
                    <Badge variant={evento.metadata.estado === 'cumplido' || evento.metadata.estado === 'realizada' ? 'success' : 'neutral'}>
                      {evento.metadata.estado}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
