'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check } from 'lucide-react'

interface Prefs {
  idioma: string
  formato_fecha: string
  zona_horaria: string
  tema: string
}

const ZONAS = [
  { v: 'America/Lima', label: 'Lima (UTC-5)' },
  { v: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
  { v: 'America/Bogota', label: 'Bogotá (UTC-5)' },
  { v: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
]

export function PreferenciasTab() {
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/configuracion/preferencias')
      .then(r => r.json())
      .then(d => setPrefs(d.data))
      .finally(() => setLoading(false))
  }, [])

  const update = async (patch: Partial<Prefs>) => {
    setSaving(true)
    const res = await fetch('/api/configuracion/preferencias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const d = await res.json()
    setPrefs(d.data)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  if (loading || !prefs) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Preferencias</h2>
        {saved && <span className="flex items-center gap-1 text-xs font-medium text-green-600"><Check size={14} /> Guardado</span>}
        {saving && !saved && <Loader2 size={14} className="animate-spin text-slate-400" />}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 p-4">
          <label className="mb-2 block font-medium text-slate-700">Idioma</label>
          <select
            value={prefs.idioma}
            onChange={e => update({ idioma: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <label className="mb-2 block font-medium text-slate-700">Formato de fecha</label>
          <select
            value={prefs.formato_fecha}
            onChange={e => update({ formato_fecha: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
          </select>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <label className="mb-2 block font-medium text-slate-700">Zona horaria</label>
          <select
            value={prefs.zona_horaria}
            onChange={e => update({ zona_horaria: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {ZONAS.map(z => <option key={z.v} value={z.v}>{z.label}</option>)}
          </select>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <label className="mb-2 block font-medium text-slate-700">Tema</label>
          <p className="mb-3 text-sm text-slate-500">El tema oscuro estará disponible próximamente</p>
          <div className="flex gap-2">
            <button
              onClick={() => update({ tema: 'light' })}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${prefs.tema === 'light' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              Claro
            </button>
            <button
              disabled
              className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400"
            >
              Oscuro (próximamente)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
