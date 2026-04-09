'use client'

import { useState, useEffect } from 'react'
import {
  UserPlus, Shield, Briefcase, GraduationCap, Headphones,
  MoreVertical, X, Mail, Phone, CheckCircle, XCircle, Clock,
  Building2, Send,
} from 'lucide-react'

interface Miembro {
  id: string
  email: string
  nombre: string
  apellidos: string
  cedula_profesional: string | null
  telefono: string | null
  rol: string
  activo: boolean
  total_expedientes: string
  created_at: string
}

interface Invitacion {
  id: string
  email: string
  rol: string
  estado: string
  created_at: string
  expires_at: string
  invitado_por_nombre: string
}

interface Despacho {
  id: string
  nombre: string
  pais: string
  plan: string
}

const ROL_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Administrador', icon: Shield, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  abogado: { label: 'Abogado', icon: Briefcase, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  pasante: { label: 'Pasante', icon: GraduationCap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  asistente: { label: 'Asistente', icon: Headphones, color: 'bg-green-50 text-green-700 border-green-200' },
}

const PLAN_BADGES: Record<string, string> = {
  basico: 'bg-slate-100 text-slate-600',
  profesional: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

export function EquipoPanel({ currentUserId }: { currentUserId?: string }) {
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([])
  const [despacho, setDespacho] = useState<Despacho | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDespachoForm, setShowDespachoForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingMiembro, setEditingMiembro] = useState<string | null>(null)
  const [modo, setModo] = useState<'directo' | 'invitacion'>('directo')

  const isAdmin = miembros.find(m => m.id === currentUserId)?.rol === 'admin'

  async function loadData() {
    const res = await fetch('/api/equipo')
    const d = await res.json()
    setMiembros(d.data || [])
    setDespacho(d.despacho || null)
    setInvitaciones(d.invitaciones || [])
  }

  useEffect(() => { loadData() }, [])

  async function handleCrearDespacho(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/equipo/despacho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: fd.get('nombre'),
        pais: fd.get('pais') || 'MX',
        direccion: fd.get('direccion') || undefined,
        telefono: fd.get('telefono') || undefined,
        email: fd.get('email') || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al crear despacho')
      setLoading(false)
      return
    }

    setShowDespachoForm(false)
    setLoading(false)
    await loadData()
  }

  async function handleAgregarMiembro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/equipo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modo,
        email: fd.get('email'),
        nombre: fd.get('nombre') || undefined,
        apellidos: fd.get('apellidos') || undefined,
        password: fd.get('password') || undefined,
        rol: fd.get('rol') || 'abogado',
        cedulaProfesional: fd.get('cedulaProfesional') || undefined,
        telefono: fd.get('telefono') || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al agregar')
      setLoading(false)
      return
    }

    if (modo === 'invitacion' && data.token) {
      setSuccess(`Invitación creada. Token: ${data.token}`)
    } else {
      setSuccess('Miembro agregado exitosamente')
    }

    setShowForm(false)
    setLoading(false)
    await loadData()
  }

  async function handleUpdateMiembro(id: string, updates: { rol?: string; activo?: boolean }) {
    const res = await fetch(`/api/equipo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al actualizar')
      return
    }

    setEditingMiembro(null)
    await loadData()
  }

  async function handleRemoverMiembro(id: string) {
    const res = await fetch(`/api/equipo/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al remover')
      return
    }

    await loadData()
  }

  // Sin despacho — mostrar opción de crear uno
  if (!despacho) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Mi Despacho</h1>
          <p className="text-sm text-slate-500">Configura tu bufete para gestionar tu equipo</p>
        </div>

        {!showDespachoForm ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white py-16">
            <Building2 className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-lg font-medium text-slate-500">Sin despacho</p>
            <p className="mt-1 text-sm text-slate-400">Crea tu despacho para comenzar a agregar miembros</p>
            <button
              onClick={() => setShowDespachoForm(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Crear Despacho
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Nuevo Despacho</h2>
              <button onClick={() => setShowDespachoForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCrearDespacho} className="space-y-3">
              <input name="nombre" placeholder="Nombre del despacho *" required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
              <div className="grid grid-cols-2 gap-3">
                <select name="pais" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400">
                  <option value="MX">México</option>
                  <option value="PE">Perú</option>
                </select>
                <input name="telefono" placeholder="Teléfono" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
              </div>
              <input name="email" type="email" placeholder="Email del despacho" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
              <input name="direccion" placeholder="Dirección" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Despacho'}
              </button>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header con info del despacho */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{despacho.nombre}</h1>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${PLAN_BADGES[despacho.plan] || PLAN_BADGES.basico}`}>
              {despacho.plan}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {despacho.pais === 'PE' ? 'Perú' : 'México'}
            </span>
          </div>
          <p className="text-sm text-slate-500">{miembros.length} miembro(s) en el equipo</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Agregar Miembro
          </button>
        )}
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">
            <X className="inline h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
          <button onClick={() => setSuccess('')} className="ml-2 text-green-500 hover:text-green-700">
            <X className="inline h-4 w-4" />
          </button>
        </div>
      )}

      {/* Formulario agregar miembro */}
      {showForm && isAdmin && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Agregar Miembro</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs modo */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setModo('directo')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                modo === 'directo' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300'
              }`}
            >
              Crear cuenta directamente
            </button>
            <button
              onClick={() => setModo('invitacion')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                modo === 'invitacion' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300'
              }`}
            >
              Enviar invitación
            </button>
          </div>

          <form onSubmit={handleAgregarMiembro} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input name="email" type="email" placeholder="Email *" required className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
              <select name="rol" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400">
                <option value="abogado">Abogado</option>
                <option value="pasante">Pasante</option>
                <option value="asistente">Asistente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {modo === 'directo' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input name="nombre" placeholder="Nombre *" required className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
                  <input name="apellidos" placeholder="Apellidos" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input name="password" type="password" placeholder="Contraseña *" required minLength={8} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
                  <input name="cedulaProfesional" placeholder="Cédula profesional" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
                </div>
                <input name="telefono" placeholder="Teléfono" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
              </>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {modo === 'invitacion' ? <Send className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {loading ? 'Procesando...' : modo === 'directo' ? 'Crear Cuenta' : 'Enviar Invitación'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de miembros */}
      <div className="space-y-3">
        {miembros.map(m => {
          const rolConfig = ROL_CONFIG[m.rol] || ROL_CONFIG.abogado
          const RolIcon = rolConfig.icon
          const isMe = m.id === currentUserId

          return (
            <div
              key={m.id}
              className={`rounded-lg border bg-white p-5 shadow-sm transition-all ${
                !m.activo ? 'opacity-60 border-slate-200' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${m.activo ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    {m.nombre.charAt(0).toUpperCase()}{m.apellidos.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {m.nombre} {m.apellidos}
                        {isMe && <span className="ml-1 text-xs text-slate-400">(tú)</span>}
                      </h3>
                      <span className={`flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${rolConfig.color}`}>
                        <RolIcon className="h-3 w-3" />
                        {rolConfig.label}
                      </span>
                      {!m.activo && (
                        <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {m.email}
                      </span>
                      {m.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {m.telefono}
                        </span>
                      )}
                      {parseInt(m.total_expedientes) > 0 && (
                        <span className="text-xs text-slate-400">{m.total_expedientes} expediente(s)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                {isAdmin && !isMe && (
                  <div className="relative">
                    <button
                      onClick={() => setEditingMiembro(editingMiembro === m.id ? null : m.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {editingMiembro === m.id && (
                      <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                        {/* Cambiar rol */}
                        {['admin', 'abogado', 'pasante', 'asistente'].filter(r => r !== m.rol).map(r => (
                          <button
                            key={r}
                            onClick={() => handleUpdateMiembro(m.id, { rol: r })}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Cambiar a {ROL_CONFIG[r]?.label || r}
                          </button>
                        ))}
                        <hr className="my-1" />
                        {/* Activar/Desactivar */}
                        <button
                          onClick={() => handleUpdateMiembro(m.id, { activo: !m.activo })}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          {m.activo ? (
                            <><XCircle className="h-4 w-4 text-red-500" /> Desactivar</>
                          ) : (
                            <><CheckCircle className="h-4 w-4 text-green-500" /> Reactivar</>
                          )}
                        </button>
                        <hr className="my-1" />
                        {/* Remover */}
                        <button
                          onClick={() => handleRemoverMiembro(m.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Remover del despacho
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Invitaciones pendientes */}
      {invitaciones.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Invitaciones Pendientes</h2>
          <div className="space-y-2">
            {invitaciones.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{inv.email}</p>
                    <p className="text-xs text-slate-500">
                      como {ROL_CONFIG[inv.rol]?.label || inv.rol} — invitado por {inv.invitado_por_nombre}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-amber-600">
                  Expira {new Date(inv.expires_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
