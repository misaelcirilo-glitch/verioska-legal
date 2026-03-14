'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

const PLAZOS_CNPP = [
  { value: 'retencion_mp_48h', label: 'Retención MP 48h', grupo: 'CNPP' },
  { value: 'retencion_mp_96h', label: 'Retención MP 96h (duplicidad)', grupo: 'CNPP' },
  { value: 'termino_constitucional_72h', label: 'Término Constitucional 72h', grupo: 'CNPP' },
  { value: 'termino_constitucional_144h', label: 'Término Constitucional 144h (duplicidad)', grupo: 'CNPP' },
  { value: 'investigacion_complementaria_2m', label: 'Inv. Complementaria 2 meses', grupo: 'CNPP' },
  { value: 'investigacion_complementaria_6m', label: 'Inv. Complementaria 6 meses', grupo: 'CNPP' },
  { value: 'apelacion_3d', label: 'Apelación 3 días hábiles', grupo: 'CNPP' },
  { value: 'amparo_indirecto_15d', label: 'Amparo Indirecto 15 días hábiles', grupo: 'Amparo' },
  { value: 'amparo_directo_15d', label: 'Amparo Directo 15 días hábiles', grupo: 'Amparo' },
  { value: 'recurso_revocacion_2d', label: 'Revocación 2 días hábiles', grupo: 'CNPP' },
  { value: 'custom', label: '--- Plazo personalizado ---', grupo: 'Custom' },
]

export function AgregarPlazoForm({ expedienteId }: { expedienteId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tipoPlazo, setTipoPlazo] = useState(PLAZOS_CNPP[0].value)
  const isCustom = tipoPlazo === 'custom'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const fechaInicio = form.get('fechaInicio') as string

    const body: Record<string, unknown> = {
      tipoPlazo: isCustom ? form.get('nombreCustom') : tipoPlazo,
      fechaInicio: new Date(fechaInicio).toISOString(),
      notas: form.get('notas') || undefined,
    }

    if (isCustom) {
      const unidad = form.get('unidad')
      const cantidad = Number(form.get('cantidad'))
      if (unidad === 'horas') body.horas = cantidad
      else {
        body.dias = cantidad
        body.diasHabiles = form.get('diasHabiles') === 'on'
      }
      body.fundamentoLegal = form.get('fundamentoLegal') || undefined
      body.descripcion = form.get('descripcion') || undefined
    }

    const res = await fetch(`/api/expedientes/${expedienteId}/plazos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
        className="mt-2 inline-flex items-center gap-1 rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
      >
        <Plus className="h-3 w-3" /> Agregar plazo
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded border border-red-200 bg-red-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nuevo Plazo</span>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <select
        name="tipo"
        value={tipoPlazo}
        onChange={(e) => setTipoPlazo(e.target.value)}
        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
      >
        {PLAZOS_CNPP.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {isCustom && (
        <>
          <input name="nombreCustom" placeholder="Nombre del plazo *" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <div className="flex gap-2">
            <input name="cantidad" type="number" min="1" placeholder="Cantidad *" required className="w-1/2 rounded border border-slate-300 px-2 py-1.5 text-sm" />
            <select name="unidad" className="w-1/2 rounded border border-slate-300 px-2 py-1.5 text-sm">
              <option value="horas">Horas</option>
              <option value="dias">Días</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" name="diasHabiles" /> Solo días hábiles
          </label>
          <input name="fundamentoLegal" placeholder="Fundamento legal" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input name="descripcion" placeholder="Descripción" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </>
      )}

      <div>
        <label className="text-xs text-slate-500">Fecha y hora de inicio</label>
        <input name="fechaInicio" type="datetime-local" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <input name="notas" placeholder="Notas (opcional)" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Calculando plazo...' : 'Guardar plazo'}
      </button>
    </form>
  )
}
