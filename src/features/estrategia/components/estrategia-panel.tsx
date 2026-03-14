'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Loader2, Sparkles, Scale, Shield, Handshake } from 'lucide-react'
import { Badge } from '@/shared/components/badge'

interface Estrategia {
  id: string
  tipo: string
  titulo: string
  descripcion: string
  fundamento_legal: string | null
  articulos_cnpp: string | null
  confianza: number | null
  aceptada: boolean
}

const tipoConfig: Record<string, { icon: typeof Shield; label: string; color: string }> = {
  defensiva: { icon: Shield, label: 'Defensiva', color: 'text-blue-500' },
  probatoria: { icon: Scale, label: 'Probatoria', color: 'text-green-500' },
  procesal: { icon: Lightbulb, label: 'Procesal', color: 'text-amber-500' },
  negociacion: { icon: Handshake, label: 'Negociación', color: 'text-purple-500' },
}

interface Props {
  expedienteId: string
}

export function EstrategiaPanel({ expedienteId }: Props) {
  const [estrategias, setEstrategias] = useState<Estrategia[]>([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/expedientes/${expedienteId}/estrategias`)
        if (!res.ok) throw new Error('Error al cargar')
        const { data } = await res.json()
        setEstrategias(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [expedienteId])

  async function handleGenerar() {
    setGenerando(true)
    setError('')
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/estrategias`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error')
      }
      // Recargar
      const res2 = await fetch(`/api/expedientes/${expedienteId}/estrategias`)
      if (res2.ok) {
        const { data } = await res2.json()
        setEstrategias(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setGenerando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleGenerar}
        disabled={generando}
        className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" />
        {generando ? 'Generando...' : 'Generar estrategias'}
      </button>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {estrategias.length === 0 ? (
        <p className="text-sm text-slate-500">Sin estrategias. Genera sugerencias basadas en el expediente.</p>
      ) : (
        <div className="space-y-3">
          {estrategias.map(e => {
            const config = tipoConfig[e.tipo] || tipoConfig.defensiva
            const Icon = config.icon
            return (
              <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-semibold text-slate-800">{e.titulo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{config.label}</Badge>
                    {e.confianza && (
                      <span className="text-xs text-slate-400">{Math.round(e.confianza * 100)}%</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{e.descripcion}</p>
                {e.fundamento_legal && (
                  <div className="mt-2 rounded bg-indigo-50 px-3 py-2">
                    <p className="text-xs font-medium text-indigo-700">Fundamento legal</p>
                    <p className="text-xs text-indigo-600">{e.fundamento_legal}</p>
                    {e.articulos_cnpp && (
                      <p className="mt-1 text-xs text-indigo-500">Arts. CNPP: {e.articulos_cnpp}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
