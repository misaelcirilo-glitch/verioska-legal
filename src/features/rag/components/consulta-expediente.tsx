'use client'

import { useState } from 'react'
import { Search, Loader2, FileText, MessageCircle } from 'lucide-react'
import { Badge } from '@/shared/components/badge'

interface Fuente {
  nombreArchivo: string
  tipoDocumento: string | null
  fragmento: string
  relevancia: number
}

interface Props {
  expedienteId: string
}

export function ConsultaExpediente({ expedienteId }: Props) {
  const [consulta, setConsulta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [fuentes, setFuentes] = useState<Fuente[]>([])
  const [usandoIA, setUsandoIA] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConsultar(e: React.FormEvent) {
    e.preventDefault()
    if (!consulta.trim()) return

    setLoading(true)
    setError('')
    setRespuesta('')
    setFuentes([])

    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/consulta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al consultar')
      }

      const { data } = await res.json()
      setRespuesta(data.respuesta)
      setFuentes(data.fuentes)
      setUsandoIA(data.usandoIA || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleConsultar} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={consulta}
            onChange={e => setConsulta(e.target.value)}
            placeholder="Pregunta al expediente... Ej: ¿Qué dijo el testigo sobre el arma?"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !consulta.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
          Consultar
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {respuesta && (
        <div className="space-y-4">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-700">
                {usandoIA ? 'Respuesta IA' : 'Resultados de búsqueda'}
              </span>
              {usandoIA && <Badge variant="info">IA</Badge>}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{respuesta}</p>
          </div>

          {fuentes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Fuentes ({fuentes.length})</p>
              <div className="space-y-2">
                {fuentes.map((f, i) => (
                  <div key={i} className="rounded border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-medium text-slate-700">{f.nombreArchivo}</span>
                      {f.tipoDocumento && <Badge variant="neutral">{f.tipoDocumento}</Badge>}
                      <span className="text-xs text-slate-400">{Math.round(f.relevancia * 100)}%</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-3">{f.fragmento}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
