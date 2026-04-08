'use client'

import { useState, useEffect } from 'react'
import { Loader2, Mail, Calendar, Cloud, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface Integracion {
  id: string
  tipo: string
  nombre: string
  activo: boolean
  created_at: string
}

const SERVICIOS = [
  { tipo: 'smtp', label: 'Email (SMTP)', icon: Mail, desc: 'Enviar notificaciones desde tu propio servidor de email', color: 'bg-blue-50 text-blue-600' },
  { tipo: 'google_calendar', label: 'Google Calendar', icon: Calendar, desc: 'Sincronizar audiencias y plazos con tu calendario', color: 'bg-red-50 text-red-600' },
  { tipo: 'outlook', label: 'Outlook Calendar', icon: Calendar, desc: 'Sincronizar con tu calendario de Microsoft', color: 'bg-blue-50 text-blue-600' },
  { tipo: 'drive', label: 'Google Drive', icon: Cloud, desc: 'Backup automático de documentos del despacho', color: 'bg-green-50 text-green-600' },
]

export function IntegracionesTab() {
  const [integraciones, setIntegraciones] = useState<Integracion[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  const load = async () => {
    const r = await fetch('/api/configuracion/integraciones')
    const d = await r.json()
    setIntegraciones(d.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleConnect = async (tipo: string, nombre: string) => {
    setConnecting(tipo)
    // Por ahora solo crea el registro. La config real (OAuth flow, SMTP credentials) viene en siguiente PRP
    await fetch('/api/configuracion/integraciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, nombre, config: {} }),
    })
    setConnecting(null)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desconectar esta integración?')) return
    await fetch(`/api/configuracion/integraciones/${id}`, { method: 'DELETE' })
    load()
  }

  const handleToggle = async (id: string, activo: boolean) => {
    await fetch(`/api/configuracion/integraciones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !activo }),
    })
    load()
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-slate-800">Integraciones</h2>
      <p className="mb-6 text-sm text-slate-500">
        Conecta servicios externos para extender las capacidades de Verioska.
        La configuración detallada (OAuth, credenciales) estará disponible en la próxima versión.
      </p>

      <div className="space-y-3">
        {SERVICIOS.map(s => {
          const conectada = integraciones.find(i => i.tipo === s.tipo)
          const isConnecting = connecting === s.tipo

          return (
            <div key={s.tipo} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800">{s.label}</p>
                  {conectada?.activo && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">Conectada</span>}
                  {conectada && !conectada.activo && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">Pausada</span>}
                </div>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {conectada ? (
                  <>
                    <button
                      onClick={() => handleToggle(conectada.id, conectada.activo)}
                      className="text-slate-400 hover:text-blue-600"
                      title={conectada.activo ? 'Pausar' : 'Activar'}
                    >
                      {conectada.activo ? <ToggleRight size={22} className="text-blue-600" /> : <ToggleLeft size={22} />}
                    </button>
                    <button
                      onClick={() => handleDelete(conectada.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(s.tipo, s.label)}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Conectar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
