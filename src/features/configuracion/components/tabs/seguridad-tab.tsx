'use client'

import { useState, useEffect } from 'react'
import { Loader2, Lock, Shield, Activity, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Acceso {
  id: string
  tipo: string
  ip: string | null
  user_agent: string | null
  created_at: string
}

const TIPO_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  login_ok: { label: 'Inicio de sesión', icon: CheckCircle, color: 'text-green-600' },
  login_fail: { label: 'Intento fallido', icon: XCircle, color: 'text-red-600' },
  logout: { label: 'Cierre de sesión', icon: Clock, color: 'text-slate-500' },
  password_change: { label: 'Cambio de contraseña', icon: Lock, color: 'text-blue-600' },
}

export function SeguridadTab() {
  const [accesos, setAccesos] = useState<Acceso[]>([])
  const [loading, setLoading] = useState(true)
  const [showPassForm, setShowPassForm] = useState(false)
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const loadAccesos = async () => {
    const r = await fetch('/api/configuracion/accesos')
    const d = await r.json()
    setAccesos(d.data || [])
    setLoading(false)
  }

  useEffect(() => { loadAccesos() }, [])

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(null)

    if (passForm.new_password !== passForm.confirm) {
      setPassMsg({ type: 'err', text: 'Las contraseñas no coinciden' })
      return
    }

    setPassLoading(true)
    const res = await fetch('/api/configuracion/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: passForm.current_password, new_password: passForm.new_password }),
    })
    const d = await res.json()
    setPassLoading(false)

    if (res.ok) {
      setPassMsg({ type: 'ok', text: 'Contraseña actualizada correctamente' })
      setPassForm({ current_password: '', new_password: '', confirm: '' })
      setShowPassForm(false)
      loadAccesos()
    } else {
      setPassMsg({ type: 'err', text: d.error || 'Error al cambiar contraseña' })
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-slate-800">Seguridad y permisos</h2>

      {/* Cambio de contraseña */}
      <div className="mb-6 rounded-lg border border-slate-200 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lock size={18} className="text-slate-400" />
          <h3 className="font-medium text-slate-800">Contraseña</h3>
        </div>
        <p className="mb-4 text-sm text-slate-500">Cambia tu contraseña periódicamente para mantener tu cuenta segura.</p>

        {!showPassForm ? (
          <button
            onClick={() => setShowPassForm(true)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cambiar contraseña
          </button>
        ) : (
          <form onSubmit={handlePassSubmit} className="space-y-3">
            <input
              type="password" required placeholder="Contraseña actual"
              value={passForm.current_password}
              onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="password" required minLength={8} placeholder="Nueva contraseña (mín. 8)"
              value={passForm.new_password}
              onChange={e => setPassForm(p => ({ ...p, new_password: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="password" required minLength={8} placeholder="Confirmar nueva contraseña"
              value={passForm.confirm}
              onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {passMsg && (
              <p className={`text-sm font-medium ${passMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{passMsg.text}</p>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={passLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {passLoading ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={() => { setShowPassForm(false); setPassMsg(null) }} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2FA */}
      <div className="mb-6 rounded-lg border border-slate-200 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Shield size={18} className="text-slate-400" />
          <h3 className="font-medium text-slate-800">Autenticación en dos pasos (2FA)</h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">Próximamente</span>
        </div>
        <p className="text-sm text-slate-500">Añade una capa extra de seguridad con un código de 6 dígitos enviado a tu app autenticadora.</p>
      </div>

      {/* Registro de accesos */}
      <div className="rounded-lg border border-slate-200 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Activity size={18} className="text-slate-400" />
          <h3 className="font-medium text-slate-800">Registro de accesos</h3>
        </div>
        <p className="mb-4 text-sm text-slate-500">Últimos 50 eventos de seguridad de tu cuenta.</p>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : accesos.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">Sin actividad registrada</p>
        ) : (
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {accesos.map(a => {
              const meta = TIPO_LABELS[a.tipo] || TIPO_LABELS.login_ok
              return (
                <div key={a.id} className="flex items-center gap-3 border-b border-slate-100 py-2 text-sm last:border-0">
                  <meta.icon size={14} className={meta.color} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">{meta.label}</p>
                    {a.ip && <p className="text-xs text-slate-400">IP: {a.ip}</p>}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(a.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
