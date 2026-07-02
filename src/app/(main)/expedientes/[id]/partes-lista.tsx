'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Star, X, UserCheck } from 'lucide-react'
import { TIPOS_PARTE_MX, TIPOS_PARTE_PE, tipoParteLabels } from '@/lib/paises/labels'

const GENEROS = ['masculino', 'femenino', 'otro']

export interface Parte {
  id: string
  tipo: string
  nombre: string
  apellidos: string | null
  alias: string | null
  edad: number | null
  genero: string | null
  notas: string | null
  cliente_id: string | null
  es_principal: boolean
  cliente_nombre?: string | null
}

export function PartesLista({
  expedienteId,
  pais = 'MX',
  rol,
  partes,
}: {
  expedienteId: string
  pais?: string
  rol: string
  partes: Parte[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<Parte | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canEdit = rol === 'admin' || rol === 'abogado'
  const tiposParte = pais === 'PE' ? TIPOS_PARTE_PE : TIPOS_PARTE_MX

  async function patch(parteId: string, payload: Record<string, unknown>) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/partes/${parteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'No se pudo guardar')
        return false
      }
      return true
    } catch {
      setError('Error de conexión')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const edadRaw = fd.get('edad') as string
    const ok = await patch(editing.id, {
      tipo: fd.get('tipo'),
      nombre: fd.get('nombre'),
      apellidos: (fd.get('apellidos') as string) || null,
      alias: (fd.get('alias') as string) || null,
      edad: edadRaw ? Number(edadRaw) : null,
      genero: (fd.get('genero') as string) || null,
      notas: (fd.get('notas') as string) || null,
    })
    if (ok) {
      setEditing(null)
      router.refresh()
    }
  }

  async function marcarPrincipal(p: Parte) {
    const ok = await patch(p.id, { esPrincipal: !p.es_principal })
    if (ok) router.refresh()
  }

  async function eliminar(p: Parte) {
    if (!confirm(`¿Eliminar a ${p.nombre} ${p.apellidos || ''} de las partes?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/partes/${p.id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
      else { const j = await res.json().catch(() => ({})); alert(j.error || 'No se pudo eliminar') }
    } finally {
      setLoading(false)
    }
  }

  if (partes.length === 0) {
    return <p className="text-sm text-slate-500">Sin partes registradas.</p>
  }

  return (
    <div className="space-y-2">
      {partes.map(p => (
        <div key={p.id} className="flex items-center justify-between gap-2 rounded border border-slate-100 bg-slate-50 p-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {p.es_principal && (
              <span title="Cliente principal del expediente">
                <Star className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />
              </span>
            )}
            <span className="truncate text-sm font-medium">{p.nombre} {p.apellidos || ''}</span>
            {p.cliente_id && (
              <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600" title="Vinculado en CRM">
                <UserCheck className="h-3 w-3" /> CRM
              </span>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
              {tipoParteLabels[p.tipo] || p.tipo}
            </span>
            {canEdit && (
              <>
                <button
                  onClick={() => marcarPrincipal(p)}
                  disabled={loading}
                  title={p.es_principal ? 'Quitar como cliente principal' : 'Marcar como cliente principal'}
                  className={`rounded p-1 hover:bg-amber-100 disabled:opacity-50 ${p.es_principal ? 'text-amber-500' : 'text-slate-400'}`}
                >
                  <Star className={`h-3.5 w-3.5 ${p.es_principal ? 'fill-amber-400' : ''}`} />
                </button>
                <button onClick={() => { setError(''); setEditing(p) }} title="Editar parte" className="rounded p-1 text-slate-500 hover:bg-slate-200">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => eliminar(p)} disabled={loading} title="Eliminar parte" className="rounded p-1 text-red-500 hover:bg-red-100 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={guardar} onClick={e => e.stopPropagation()} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Editar parte</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Rol *</label>
                <select name="tipo" required defaultValue={editing.tipo} className="w-full rounded border border-slate-300 px-3 py-2 text-sm">
                  {!tiposParte.some(t => t.value === editing!.tipo) && <option value={editing.tipo}>{tipoParteLabels[editing.tipo] || editing.tipo}</option>}
                  {tiposParte.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Alias</label>
                  <input name="alias" defaultValue={editing.alias || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Edad</label>
                  <input name="edad" type="number" min={0} defaultValue={editing.edad ?? ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Género</label>
                  <select name="genero" defaultValue={editing.genero || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm capitalize">
                    <option value="">—</option>
                    {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Notas</label>
                <textarea name="notas" rows={2} defaultValue={editing.notas || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              {error && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
