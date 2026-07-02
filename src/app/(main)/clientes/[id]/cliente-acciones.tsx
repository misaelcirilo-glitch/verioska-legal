'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Archive, Trash2, X } from 'lucide-react'

const TIPOS_DOC = ['dni', 'ce', 'pasaporte', 'ine', 'curp', 'ruc', 'rfc']
const ESTADOS = ['prospecto', 'activo', 'inactivo', 'archivado']
const FUENTES = ['referido', 'web', 'redes_sociales', 'directorio', 'otro']

interface ClienteData {
  id: string
  nombre: string
  apellidos: string | null
  tipoDocumento: string | null
  numeroDocumento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  estado: string
  fuente: string | null
  notas: string | null
}

export function ClienteAcciones({ cliente, onUpdated }: { cliente: ClienteData; onUpdated: () => void }) {
  const router = useRouter()
  const [rol, setRol] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setRol(d.data?.rol || d.rol || '')).catch(() => {})
  }, [])

  const canEdit = rol === 'admin' || rol === 'abogado'
  const isAdmin = rol === 'admin'

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
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
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'No se pudo guardar'); return }
      setEditing(false); onUpdated()
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  async function archivar() {
    if (!confirm('¿Archivar este cliente?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'archivado' }),
      })
      if (res.ok) onUpdated()
      else { const j = await res.json().catch(() => ({})); alert(j.error || 'No se pudo archivar') }
    } finally { setLoading(false) }
  }

  async function eliminar() {
    if (!confirm('⚠️ Eliminar permanentemente este cliente. Si tiene expedientes, se archivará en su lugar. ¿Continuar?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' })
      const j = await res.json().catch(() => ({}))
      if (res.ok) {
        if (j.data?.archived) { alert('El cliente tiene expedientes: se archivó en lugar de eliminarse.'); onUpdated() }
        else router.push('/clientes')
      } else alert(j.error || 'No se pudo eliminar')
    } finally { setLoading(false) }
  }

  if (!canEdit) return null

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </button>
        <button onClick={archivar} disabled={loading} className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50">
          <Archive className="h-3.5 w-3.5" /> Archivar
        </button>
        {isAdmin && (
          <button onClick={eliminar} disabled={loading} className="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" /> Eliminar
          </button>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(false)}>
          <form onSubmit={guardar} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Editar cliente</h3>
              <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Nombre *</label>
                  <input name="nombre" required defaultValue={cliente.nombre} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Apellidos</label>
                  <input name="apellidos" defaultValue={cliente.apellidos || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Tipo doc.</label>
                  <select name="tipoDocumento" defaultValue={cliente.tipoDocumento || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm uppercase">
                    <option value="">—</option>
                    {TIPOS_DOC.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">N° documento</label>
                  <input name="numeroDocumento" defaultValue={cliente.numeroDocumento || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Teléfono</label>
                  <input name="telefono" defaultValue={cliente.telefono || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
                  <input name="email" type="email" defaultValue={cliente.email || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Dirección</label>
                <input name="direccion" defaultValue={cliente.direccion || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Estado</label>
                  <select name="estado" defaultValue={cliente.estado} className="w-full rounded border border-slate-300 px-3 py-2 text-sm capitalize">
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Fuente</label>
                  <select name="fuente" defaultValue={cliente.fuente || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm capitalize">
                    <option value="">—</option>
                    {FUENTES.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Notas</label>
                <textarea name="notas" rows={3} defaultValue={cliente.notas || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              {error && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
