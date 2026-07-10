'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, Phone, Mail, X, Pencil, Trash2, AlertTriangle } from 'lucide-react'

interface ClienteRow {
  id: string
  nombre: string
  apellidos: string | null
  tipo_documento: string | null
  numero_documento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  estado: string
  fuente: string | null
  notas: string | null
  total_expedientes: string
  created_at: string
}

const TIPOS_DOC = ['dni', 'ce', 'pasaporte', 'ine', 'curp', 'ruc', 'rfc']
const ESTADOS = ['prospecto', 'activo', 'inactivo', 'archivado']
const FUENTES = ['referido', 'web', 'redes_sociales', 'directorio', 'otro']

const ESTADOS_BADGE: Record<string, string> = {
  prospecto: 'bg-blue-50 text-blue-700',
  activo: 'bg-green-50 text-green-700',
  inactivo: 'bg-slate-100 text-slate-600',
  archivado: 'bg-slate-50 text-slate-400',
}

export default function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rol, setRol] = useState('')
  const [editing, setEditing] = useState<ClienteRow | null>(null)
  const [deleting, setDeleting] = useState<ClienteRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const reload = useCallback(async () => {
    const d = await (await fetch('/api/clientes')).json()
    setClientes(d.data || [])
  }, [])

  useEffect(() => {
    reload().catch(() => {})
    fetch('/api/auth/me').then(r => r.json()).then(d => setRol(d.data?.rol || '')).catch(() => {})
  }, [reload])

  const canEdit = rol === 'admin' || rol === 'abogado'
  const isAdmin = rol === 'admin'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)

    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: fd.get('nombre'),
        apellidos: fd.get('apellidos') || undefined,
        telefono: fd.get('telefono') || undefined,
        email: fd.get('email') || undefined,
        tipoDocumento: fd.get('tipoDocumento') || undefined,
        numeroDocumento: fd.get('numeroDocumento') || undefined,
        estado: fd.get('estado') || 'activo',
        fuente: fd.get('fuente') || undefined,
        notas: fd.get('notas') || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
      setLoading(false)
      return
    }

    setShowForm(false)
    setLoading(false)
    await reload()
    router.refresh()
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    setActionLoading(true)
    setActionError('')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/clientes/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: fd.get('nombre'),
          apellidos: fd.get('apellidos') || null,
          tipoDocumento: fd.get('tipoDocumento') || null,
          numeroDocumento: fd.get('numeroDocumento') || null,
          telefono: fd.get('telefono') || null,
          email: fd.get('email') || '',
          direccion: fd.get('direccion') || null,
          estado: fd.get('estado'),
          fuente: fd.get('fuente') || null,
          notas: fd.get('notas') || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setActionError(j.error || 'No se pudo guardar')
        return
      }
      setEditing(null)
      await reload()
    } catch {
      setActionError('Error de conexión')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setActionLoading(true)
    setActionError('')
    try {
      const res = await fetch(`/api/clientes/${deleting.id}`, { method: 'DELETE' })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setActionError(j.error || 'No se pudo eliminar')
        return
      }
      setDeleting(null)
      await reload()
    } catch {
      setActionError('Error de conexión')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">{clientes.length} cliente(s) registrado(s)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Nuevo Cliente</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input name="nombre" placeholder="Nombre *" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input name="apellidos" placeholder="Apellidos" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="telefono" placeholder="Teléfono" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input name="email" type="email" placeholder="Email" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select name="tipoDocumento" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Tipo documento</option>
                <option value="dni">DNI</option>
                <option value="ce">CE</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="ine">INE</option>
                <option value="curp">CURP</option>
              </select>
              <input name="numeroDocumento" placeholder="N° Documento" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <select name="fuente" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Fuente</option>
                <option value="referido">Referido</option>
                <option value="web">Web</option>
                <option value="redes_sociales">Redes Sociales</option>
                <option value="directorio">Directorio</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <textarea name="notas" placeholder="Notas (opcional)" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </form>
        </div>
      )}

      {clientes.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white py-16">
          <Users className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Sin clientes</p>
          <p className="mt-1 text-sm text-slate-400">Registra tu primer cliente para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientes.map(c => (
            <div
              key={c.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Link href={`/clientes/${c.id}`} className="font-semibold text-blue-600 hover:underline">
                      {c.nombre} {c.apellidos || ''}
                    </Link>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${ESTADOS_BADGE[c.estado] || ''}`}>
                      {c.estado}
                    </span>
                    {parseInt(c.total_expedientes) > 0 && (
                      <span className="text-xs text-slate-500">{c.total_expedientes} caso(s)</span>
                    )}
                  </div>
                  <div className="mt-1 flex gap-4 text-sm text-slate-500">
                    {c.telefono && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.telefono}
                      </span>
                    )}
                    {c.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {c.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setActionError(''); setEditing(c) }}
                        title="Editar cliente"
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { setActionError(''); setDeleting(c) }}
                          title="Eliminar cliente"
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <div className="text-right text-xs text-slate-400">
                    <p>{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={handleEdit} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Editar cliente</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Nombre *</label>
                  <input name="nombre" required defaultValue={editing.nombre} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Apellidos</label>
                  <input name="apellidos" defaultValue={editing.apellidos || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Tipo doc.</label>
                  <select name="tipoDocumento" defaultValue={editing.tipo_documento || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm uppercase">
                    <option value="">—</option>
                    {TIPOS_DOC.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">N° documento</label>
                  <input name="numeroDocumento" defaultValue={editing.numero_documento || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Teléfono</label>
                  <input name="telefono" defaultValue={editing.telefono || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
                  <input name="email" type="email" defaultValue={editing.email || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Dirección</label>
                <input name="direccion" defaultValue={editing.direccion || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Estado</label>
                  <select name="estado" defaultValue={editing.estado} className="w-full rounded border border-slate-300 px-3 py-2 text-sm capitalize">
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Fuente</label>
                  <select name="fuente" defaultValue={editing.fuente || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm capitalize">
                    <option value="">—</option>
                    {FUENTES.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Notas</label>
                <textarea name="notas" rows={3} defaultValue={editing.notas || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              {actionError && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{actionError}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={actionLoading} className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                {actionLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {deleting && (() => {
        const conExpedientes = parseInt(deleting.total_expedientes) > 0
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleting(null)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${conExpedientes ? 'bg-amber-100' : 'bg-red-100'}`}>
                  <AlertTriangle className={`h-5 w-5 ${conExpedientes ? 'text-amber-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {conExpedientes ? 'Archivar cliente' : 'Eliminar cliente'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium">{deleting.nombre} {deleting.apellidos || ''}</span>
                  </p>
                </div>
              </div>

              {conExpedientes ? (
                <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Este cliente tiene <strong>{deleting.total_expedientes} expediente(s) vinculado(s)</strong>. No se puede eliminar permanentemente; en su lugar se <strong>archivará</strong> para conservar el historial procesal.
                </div>
              ) : (
                <p className="mb-5 text-sm text-slate-600">
                  Esta acción eliminará el cliente de forma <strong>permanente</strong>. No se puede deshacer.
                </p>
              )}

              {actionError && <p className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{actionError}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleting(null)}
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className={`rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${conExpedientes ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {actionLoading ? 'Procesando...' : conExpedientes ? 'Archivar' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
