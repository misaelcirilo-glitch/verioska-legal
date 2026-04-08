'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check } from 'lucide-react'

interface Prefs {
  notif_audiencias: boolean
  notif_plazos: boolean
  notif_sistema: boolean
  notif_email: boolean
  notif_frecuencia: string
}

export function NotificacionesTab() {
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

  const toggles = [
    { key: 'notif_audiencias', label: 'Alertas de audiencias', desc: 'Recibir avisos antes de cada audiencia' },
    { key: 'notif_plazos', label: 'Alertas de plazos procesales', desc: 'Avisos cuando un plazo está por vencer' },
    { key: 'notif_sistema', label: 'Avisos del sistema', desc: 'Notificaciones de la plataforma' },
    { key: 'notif_email', label: 'Sincronización por email', desc: 'Enviar las alertas también a tu correo' },
  ] as const

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Notificaciones</h2>
        {saved && <span className="flex items-center gap-1 text-xs font-medium text-green-600"><Check size={14} /> Guardado</span>}
        {saving && !saved && <Loader2 size={14} className="animate-spin text-slate-400" />}
      </div>

      <div className="space-y-3">
        {toggles.map(t => (
          <label key={t.key} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-700">{t.label}</p>
              <p className="text-sm text-slate-500">{t.desc}</p>
            </div>
            <input
              type="checkbox"
              checked={prefs[t.key]}
              onChange={e => update({ [t.key]: e.target.checked } as Partial<Prefs>)}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        ))}

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="mb-2 font-medium text-slate-700">Frecuencia de email</p>
          <p className="mb-3 text-sm text-slate-500">Cómo recibirás las notificaciones por correo</p>
          <select
            value={prefs.notif_frecuencia}
            onChange={e => update({ notif_frecuencia: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="inmediata">Inmediata (cada notificación)</option>
            <option value="diaria">Resumen diario</option>
            <option value="semanal">Resumen semanal</option>
          </select>
        </div>
      </div>
    </div>
  )
}
