'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { TIPOS_AUDIENCIA_MX, TIPOS_AUDIENCIA_PE } from '@/lib/paises/labels'

export function AgregarAudienciaForm({ expedienteId, pais = 'MX' }: { expedienteId: string; pais?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tiposAudiencia = pais === 'PE' ? TIPOS_AUDIENCIA_PE : TIPOS_AUDIENCIA_MX

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    const res = await fetch(`/api/expedientes/${expedienteId}/audiencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoAudiencia: form.get('tipoAudiencia'),
        fechaProgramada: form.get('fechaProgramada'),
        sala: form.get('sala') || undefined,
        juzgado: form.get('juzgado') || undefined,
        juez: form.get('juez') || undefined,
        notas: form.get('notas') || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 rounded bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
      >
        <Plus className="h-3 w-3" /> Agregar audiencia
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nueva Audiencia</span>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <select name="tipoAudiencia" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm">
        {tiposAudiencia.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <div>
        <label className="text-xs text-slate-500">Fecha y hora</label>
        <input name="fechaProgramada" type="datetime-local" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <input name="sala" placeholder="Sala (opcional)" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <input name="juzgado" placeholder={pais === 'PE' ? 'Juzgado / Sala (opcional)' : 'Juzgado (opcional)'} className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <input name="juez" placeholder={pais === 'PE' ? 'Juez / Fiscal (opcional)' : 'Juez (opcional)'} className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <input name="notas" placeholder="Notas (opcional)" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
