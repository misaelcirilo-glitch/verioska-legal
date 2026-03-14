'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'

const TIPOS_DECLARACION = [
  { value: 'ministerial', label: 'Ministerial' },
  { value: 'judicial', label: 'Judicial' },
  { value: 'ampliacion', label: 'Ampliación' },
  { value: 'careo', label: 'Careo' },
  { value: 'informativa', label: 'Informativa' },
  { value: 'pericial', label: 'Pericial' },
]

interface Parte {
  id: string
  nombre: string
  apellidos: string | null
  tipo: string
}

interface Props {
  expedienteId: string
  partes: Parte[]
}

export function AgregarDeclaracionForm({ expedienteId, partes }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contenido, setContenido] = useState('')
  const [tipo, setTipo] = useState('ministerial')
  const [parteId, setParteId] = useState('')
  const [fechaDeclaracion, setFechaDeclaracion] = useState('')
  const [contexto, setContexto] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/declaraciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido,
          tipo,
          parteId: parteId || undefined,
          fechaDeclaracion: fechaDeclaracion || undefined,
          contexto: contexto || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }

      setContenido('')
      setTipo('ministerial')
      setParteId('')
      setFechaDeclaracion('')
      setContexto('')
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" /> Agregar declaración
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Nueva declaración</span>
        <button type="button" onClick={() => { setOpen(false); setError('') }}>
          <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {TIPOS_DECLARACION.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Declarante</label>
          <select
            value={parteId}
            onChange={e => setParteId(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Sin asignar</option>
            {partes.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellidos || ''} ({p.tipo})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Fecha</label>
          <input
            type="datetime-local"
            value={fechaDeclaracion}
            onChange={e => setFechaDeclaracion(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Contenido de la declaración</label>
        <textarea
          value={contenido}
          onChange={e => setContenido(e.target.value)}
          rows={6}
          required
          placeholder="Transcribe o pega el contenido de la declaración aquí..."
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Contexto (opcional)</label>
        <input
          type="text"
          value={contexto}
          onChange={e => setContexto(e.target.value)}
          placeholder="Ej: Declaración ante el MP de Iztapalapa"
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!contenido || loading}
        className="w-full rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar declaración'}
      </button>
    </form>
  )
}
