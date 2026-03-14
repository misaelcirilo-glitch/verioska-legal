'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { TIPOS_PARTE_MX, TIPOS_PARTE_PE } from '@/lib/paises/labels'

export function AgregarParteForm({ expedienteId, pais = 'MX' }: { expedienteId: string; pais?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tiposParte = pais === 'PE' ? TIPOS_PARTE_PE : TIPOS_PARTE_MX

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    const res = await fetch(`/api/expedientes/${expedienteId}/partes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: form.get('tipo'),
        nombre: form.get('nombre'),
        apellidos: form.get('apellidos') || undefined,
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
        className="mt-2 inline-flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
      >
        <Plus className="h-3 w-3" /> Agregar parte
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nueva Parte</span>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <select name="tipo" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm">
        {tiposParte.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <input name="nombre" placeholder="Nombre *" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <input name="apellidos" placeholder="Apellidos" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      <input name="notas" placeholder="Notas (opcional)" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
