'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, Search, Shield } from 'lucide-react'
import { Badge } from '@/shared/components/badge'

interface Contradiccion {
  id: string
  descripcion: string
  tema: string | null
  severidad: string
  utilidad_defensiva: string | null
  revisada: boolean
}

interface Props {
  expedienteId: string
}

const severidadConfig: Record<string, { color: string; label: string }> = {
  critica: { color: 'bg-red-100 text-red-700', label: 'Crítica' },
  alta: { color: 'bg-orange-100 text-orange-700', label: 'Alta' },
  media: { color: 'bg-yellow-100 text-yellow-700', label: 'Media' },
  baja: { color: 'bg-slate-100 text-slate-600', label: 'Baja' },
}

export function ContradiccionesPanel({ expedienteId }: Props) {
  const [contradicciones, setContradicciones] = useState<Contradiccion[]>([])
  const [loading, setLoading] = useState(true)
  const [analizando, setAnalizando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchContradicciones() {
      try {
        const res = await fetch(`/api/expedientes/${expedienteId}/contradicciones`)
        if (!res.ok) throw new Error('Error al cargar')
        const { data } = await res.json()
        setContradicciones(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    fetchContradicciones()
  }, [expedienteId])

  async function handleAnalizar() {
    setAnalizando(true)
    setError('')
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/contradicciones`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al analizar')
      }
      const { data } = await res.json()
      setError('')
      router.refresh()
      // Recargar contradicciones
      const res2 = await fetch(`/api/expedientes/${expedienteId}/contradicciones`)
      if (res2.ok) {
        const { data: updated } = await res2.json()
        setContradicciones(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setAnalizando(false)
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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleAnalizar}
          disabled={analizando}
          className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {analizando ? 'Analizando...' : 'Analizar contradicciones'}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {contradicciones.length === 0 ? (
        <div className="py-4 text-center">
          <Shield className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">
            Sin contradicciones detectadas. Agrega declaraciones y ejecuta el análisis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contradicciones.map(c => {
            const config = severidadConfig[c.severidad] || severidadConfig.media
            return (
              <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${c.severidad === 'critica' ? 'text-red-500' : c.severidad === 'alta' ? 'text-orange-500' : 'text-yellow-500'}`} />
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    {c.tema && <Badge variant="neutral">{c.tema}</Badge>}
                  </div>
                  {c.revisada && <Badge variant="success">Revisada</Badge>}
                </div>
                <p className="text-sm text-slate-700">{c.descripcion}</p>
                {c.utilidad_defensiva && (
                  <div className="mt-2 rounded bg-blue-50 p-2">
                    <p className="text-xs font-medium text-blue-700">Utilidad defensiva:</p>
                    <p className="text-xs text-blue-600">{c.utilidad_defensiva}</p>
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
