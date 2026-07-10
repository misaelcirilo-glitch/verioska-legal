'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, UserCheck, Search } from 'lucide-react'
import { TIPOS_PARTE_MX, TIPOS_PARTE_PE } from '@/lib/paises/labels'

interface Cliente {
  id: string
  nombre: string
  apellidos: string | null
  numero_documento: string | null
}

export function AgregarParteForm({ expedienteId, pais = 'MX' }: { expedienteId: string; pais?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modo, setModo] = useState<'cliente' | 'manual'>('cliente')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [tipo, setTipo] = useState('')
  const [esPrincipal, setEsPrincipal] = useState(false)

  const tiposParte = pais === 'PE' ? TIPOS_PARTE_PE : TIPOS_PARTE_MX

  useEffect(() => {
    if (open && modo === 'cliente') {
      fetch('/api/clientes')
        .then(r => r.json())
        .then(d => setClientes(d.data || []))
    }
  }, [open, modo])

  const clientesFiltrados = clientes.filter(c => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.apellidos || '').toLowerCase().includes(q) ||
      (c.numero_documento || '').toLowerCase().includes(q)
    )
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    let body: Record<string, unknown>
    if (modo === 'cliente' && clienteSeleccionado) {
      body = {
        tipo: form.get('tipo'),
        nombre: clienteSeleccionado.nombre,
        apellidos: clienteSeleccionado.apellidos || undefined,
        clienteId: clienteSeleccionado.id,
        notas: form.get('notas') || undefined,
        esPrincipal,
      }
    } else {
      body = {
        tipo: form.get('tipo'),
        nombre: form.get('nombre'),
        apellidos: form.get('apellidos') || undefined,
        notas: form.get('notas') || undefined,
        esPrincipal,
      }
    }

    const res = await fetch(`/api/expedientes/${expedienteId}/partes`, {
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
    setClienteSeleccionado(null)
    setBusqueda('')
    setEsPrincipal(false)
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
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nueva Parte</span>
        <button type="button" onClick={() => { setOpen(false); setClienteSeleccionado(null); setBusqueda('') }} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs modo */}
      <div className="flex gap-1 rounded bg-slate-200 p-0.5">
        <button
          type="button"
          onClick={() => setModo('cliente')}
          className={`flex-1 rounded px-2 py-1 text-xs font-medium ${modo === 'cliente' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}
        >
          Cliente registrado
        </button>
        <button
          type="button"
          onClick={() => setModo('manual')}
          className={`flex-1 rounded px-2 py-1 text-xs font-medium ${modo === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}
        >
          Manual
        </button>
      </div>

      <select
        name="tipo" required
        value={tipo}
        onChange={e => setTipo(e.target.value)}
        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
      >
        <option value="">Seleccionar rol...</option>
        {tiposParte.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {modo === 'cliente' ? (
        <div>
          {clienteSeleccionado ? (
            <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2 text-sm">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="flex-1 font-medium text-slate-800">
                {clienteSeleccionado.nombre} {clienteSeleccionado.apellidos || ''}
              </span>
              <button type="button" onClick={() => setClienteSeleccionado(null)} className="text-slate-400 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full rounded border border-slate-300 bg-white pl-7 pr-2 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div className="mt-1 max-h-32 overflow-y-auto rounded border border-slate-200 bg-white">
                {clientesFiltrados.length === 0 ? (
                  <p className="p-2 text-center text-xs text-slate-400">Sin clientes</p>
                ) : clientesFiltrados.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setClienteSeleccionado(c)}
                    className="block w-full border-b border-slate-100 px-2 py-1.5 text-left text-xs hover:bg-blue-50 last:border-0"
                  >
                    <span className="font-medium text-slate-800">{c.nombre} {c.apellidos || ''}</span>
                    {c.numero_documento && <span className="ml-2 text-slate-400">({c.numero_documento})</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <input name="nombre" placeholder="Nombre *" required className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900" />
          <input name="apellidos" placeholder="Apellidos" className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900" />
        </>
      )}

      <input name="notas" placeholder="Notas (opcional)" className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900" />

      <label className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={esPrincipal}
          onChange={e => setEsPrincipal(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 accent-amber-600"
        />
        <span>
          <span className="font-medium text-amber-800">Marcar como cliente principal</span> del expediente.
          {modo === 'manual' && ' Se creará automáticamente en tu directorio de clientes.'}
        </span>
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || (modo === 'cliente' && !clienteSeleccionado)}
        className="w-full rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : modo === 'cliente' ? 'Vincular cliente como parte' : 'Guardar parte'}
      </button>
    </form>
  )
}
