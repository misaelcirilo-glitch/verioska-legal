'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, Plus, ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react'
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

interface Plantilla {
  id: string
  nombre: string
  categoria: string
}

interface CampoEditable {
  key: string
  label: string
}

type Modo = 'predefinida' | 'plantilla_propia' | 'ia'

interface Props {
  expedienteId: string
}

export function EscritosPanel({ expedienteId }: Props) {
  const [escritos, setEscritos] = useState<Escrito[]>([])
  const [tipos, setTipos] = useState<TipoEscrito[]>([])
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [modo, setModo] = useState<Modo>('predefinida')
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')
  const [selectedPlantilla, setSelectedPlantilla] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  // Modo IA: campos editables + instrucciones
  const [camposEditables, setCamposEditables] = useState<CampoEditable[]>([])
  const [campos, setCampos] = useState<Record<string, string>>({})
  const [instrucciones, setInstrucciones] = useState('')
  const [iaDisponible, setIaDisponible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/expedientes/${expedienteId}/escritos`)
        if (!res.ok) throw new Error('Error al cargar')
        const { data, tiposDisponibles, plantillas: plt, camposEditables: ce, variablesExpediente, iaDisponible: iaOk } = await res.json()
        setEscritos(data)
        setTipos(tiposDisponibles)
        setPlantillas(plt || [])
        setCamposEditables(ce || [])
        setIaDisponible(!!iaOk)
        if (tiposDisponibles.length > 0) setSelectedTipo(tiposDisponibles[0].value)
        if (plt && plt.length > 0) setSelectedPlantilla(plt[0].id)
        // Pre-cargar los campos editables con las variables del expediente.
        if (ce && variablesExpediente) {
          const init: Record<string, string> = {}
          for (const c of ce as CampoEditable[]) init[c.key] = variablesExpediente[c.key] ?? ''
          setCampos(init)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [expedienteId])

  async function handleGenerar() {
    let body: Record<string, unknown>
    if (modo === 'plantilla_propia') {
      if (!selectedPlantilla) return
      body = { origen: 'plantilla_propia', plantillaId: selectedPlantilla }
    } else if (modo === 'ia') {
      if (!selectedTipo) return
      body = { origen: 'ia', tipoEscrito: selectedTipo, campos, instrucciones: instrucciones || undefined }
    } else {
      if (!selectedTipo) return
      body = { origen: 'predefinida', tipoEscrito: selectedTipo }
    }
    setGenerando(true)
    setError('')
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/escritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      {/* Selector de modo */}
      <div className="mb-3 flex gap-1 rounded bg-slate-100 p-0.5">
        <button
          type="button"
          onClick={() => setModo('predefinida')}
          className={`flex-1 rounded px-2 py-1 text-xs font-medium ${modo === 'predefinida' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}
        >
          Predefinida
        </button>
        <button
          type="button"
          onClick={() => setModo('plantilla_propia')}
          className={`flex-1 rounded px-2 py-1 text-xs font-medium ${modo === 'plantilla_propia' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}
        >
          Plantilla del despacho
        </button>
        <button
          type="button"
          onClick={() => setModo('ia')}
          className={`flex-1 inline-flex items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium ${modo === 'ia' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}
        >
          <Sparkles className="h-3 w-3" /> Generar con IA
        </button>
      </div>

      <div className="mb-4 flex items-end gap-3">
        <div className="flex-1">
          {modo === 'plantilla_propia' ? (
            <>
              <label className="mb-1 block text-xs font-medium text-slate-600">Plantilla del despacho</label>
              {plantillas.length === 0 ? (
                <p className="rounded border border-dashed border-slate-300 px-2 py-1.5 text-xs text-slate-500">
                  No hay plantillas. Créalas en Configuración → Plantillas (usa {'{{campo}}'} para los datos del expediente).
                </p>
              ) : (
                <select
                  value={selectedPlantilla}
                  onChange={e => setSelectedPlantilla(e.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                >
                  {plantillas.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              )}
            </>
          ) : (
            <>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {modo === 'ia' ? 'Modelo base' : 'Tipo de escrito'}
              </label>
              <select
                value={selectedTipo}
                onChange={e => setSelectedTipo(e.target.value)}
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              >
                {tipos.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <button
          onClick={handleGenerar}
          disabled={generando || (modo === 'plantilla_propia' ? !selectedPlantilla : !selectedTipo)}
          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {modo === 'ia' ? <Sparkles className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {generando ? 'Generando...' : modo === 'ia' ? 'Generar con IA' : 'Generar'}
        </button>
      </div>

      {/* Modo IA: campos editables + instrucciones */}
      {modo === 'ia' && (
        <div className="mb-4 space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
          {!iaDisponible && (
            <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
              La IA no está configurada (falta OPENROUTER_API_KEY). Se generará el modelo base con tus campos;
              conéctala para obtener una redacción enriquecida.
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Campos editables</label>
            <div className="grid grid-cols-2 gap-2">
              {camposEditables.map(c => (
                <div key={c.key}>
                  <label className="mb-0.5 block text-[11px] text-slate-500">{c.label}</label>
                  <input
                    type="text"
                    value={campos[c.key] ?? ''}
                    onChange={e => setCampos(prev => ({ ...prev, [c.key]: e.target.value }))}
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Instrucciones para la IA (opcional)</label>
            <textarea
              value={instrucciones}
              onChange={e => setInstrucciones(e.target.value)}
              rows={2}
              placeholder="Ej.: enfatiza la violación al plazo de 48h y solicita medida cautelar menos lesiva."
              className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900"
            />
          </div>
        </div>
      )}

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
