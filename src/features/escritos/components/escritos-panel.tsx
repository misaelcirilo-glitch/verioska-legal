'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, Plus, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { Badge } from '@/shared/components/badge'

interface Escrito {
  id: string
  tipo_escrito: string
  titulo: string
  contenido: string
  estado: string
  created_at: string
}

interface TipoEscrito {
  value: string
  label: string
}

interface Props {
  expedienteId: string
}

export function EscritosPanel({ expedienteId }: Props) {
  const [escritos, setEscritos] = useState<Escrito[]>([])
  const [tipos, setTipos] = useState<TipoEscrito[]>([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/expedientes/${expedienteId}/escritos`)
        if (!res.ok) throw new Error('Error al cargar')
        const { data, tiposDisponibles } = await res.json()
        setEscritos(data)
        setTipos(tiposDisponibles)
        if (tiposDisponibles.length > 0) setSelectedTipo(tiposDisponibles[0].value)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [expedienteId])

  async function handleGenerar() {
    if (!selectedTipo) return
    setGenerando(true)
    setError('')
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/escritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoEscrito: selectedTipo }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error')
      }
      // Recargar
      const res2 = await fetch(`/api/expedientes/${expedienteId}/escritos`)
      if (res2.ok) {
        const { data } = await res2.json()
        setEscritos(data)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setGenerando(false)
    }
  }

  async function handleCopy(contenido: string) {
    await navigator.clipboard.writeText(contenido)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <div className="mb-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Tipo de escrito</label>
          <select
            value={selectedTipo}
            onChange={e => setSelectedTipo(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {tipos.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerar}
          disabled={generando || !selectedTipo}
          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {generando ? 'Generando...' : 'Generar'}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {escritos.length === 0 ? (
        <p className="text-sm text-slate-500">Sin escritos generados. Selecciona un tipo y genera tu primer escrito.</p>
      ) : (
        <div className="space-y-3">
          {escritos.map(e => (
            <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-slate-800">{e.titulo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={e.estado === 'finalizado' ? 'success' : e.estado === 'revisado' ? 'info' : 'neutral'}>
                    {e.estado}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(e.created_at).toLocaleDateString('es-MX')}
                  </span>
                  <button
                    onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100"
                  >
                    {expandedId === e.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {expandedId === e.id && (
                <div className="mt-3">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => handleCopy(e.contenido)}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <pre className="max-h-96 overflow-y-auto rounded bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-mono">
                    {e.contenido}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
