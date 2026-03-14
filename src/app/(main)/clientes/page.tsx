'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, Phone, Mail, X } from 'lucide-react'

interface ClienteRow {
  id: string
  nombre: string
  apellidos: string | null
  telefono: string | null
  email: string | null
  estado: string
  total_expedientes: string
  created_at: string
}

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

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(d => setClientes(d.data || []))
      .catch(() => {})
  }, [])

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
    // Re-fetch
    const d = await (await fetch('/api/clientes')).json()
    setClientes(d.data || [])
    router.refresh()
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
                    <h3 className="font-semibold text-slate-900">
                      {c.nombre} {c.apellidos || ''}
                    </h3>
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
                <div className="text-right text-xs text-slate-400">
                  <p>{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
