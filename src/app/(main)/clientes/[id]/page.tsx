'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, Mail, FolderOpen, DollarSign, ArrowLeft, Loader2, MapPin, IdCard } from 'lucide-react'

interface Cliente {
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
  createdAt: string
}

interface Expediente {
  id: string
  numero_carpeta_fiscal: string | null
  numero_expediente_judicial: string | null
  delito: string | null
  etapa_procesal: string | null
  juzgado: string | null
  fiscalia: string | null
  estado: string | null
  created_at: string
  gastos_total: number
}

interface Pago {
  id: string
  monto: number
  moneda: string | null
  concepto: string | null
  estado: string
  metodo_pago: string | null
  fecha_vencimiento: string | null
  fecha_pago: string | null
  created_at: string
  numero_carpeta_fiscal: string | null
  numero_expediente_judicial: string | null
}

interface Stats {
  totalFacturado: number
  totalPagado: number
  pendiente: number
}

export default function ClienteDetallePage() {
  const params = useParams()
  const id = params?.id as string
  const [activeTab, setActiveTab] = useState<'info' | 'expedientes' | 'pagos'>('expedientes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [stats, setStats] = useState<Stats>({ totalFacturado: 0, totalPagado: 0, pendiente: 0 })

  useEffect(() => {
    if (!id) return
    fetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setCliente(d.data.cliente)
        setExpedientes(d.data.expedientes || [])
        setPagos(d.data.pagos || [])
        setStats(d.data.stats || { totalFacturado: 0, totalPagado: 0, pendiente: 0 })
      })
      .catch(() => setError('Error cargando cliente'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8 flex justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/clientes" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Volver a Clientes
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || 'Cliente no encontrado'}
        </div>
      </div>
    )
  }

  const nombreCompleto = `${cliente.nombre}${cliente.apellidos ? ' ' + cliente.apellidos : ''}`
  const iniciales = nombreCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const ESTADO_STYLE: Record<string, string> = {
    activo: 'bg-green-50 text-green-700',
    prospecto: 'bg-blue-50 text-blue-700',
    inactivo: 'bg-slate-100 text-slate-600',
    archivado: 'bg-slate-100 text-slate-500',
  }

  const PAGO_ESTADO: Record<string, string> = {
    pagado: 'bg-green-100 text-green-700',
    pendiente: 'bg-amber-100 text-amber-700',
    vencido: 'bg-red-100 text-red-700',
    cancelado: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link href="/clientes" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Volver a Clientes
      </Link>

      {/* Header Cliente */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              {iniciales || <User />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{nombreCompleto}</h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                {cliente.telefono && (
                  <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {cliente.telefono}</span>
                )}
                {cliente.email && (
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {cliente.email}</span>
                )}
                {cliente.numeroDocumento && (
                  <span className="flex items-center gap-1.5"><IdCard className="h-4 w-4" /> {cliente.tipoDocumento?.toUpperCase()} {cliente.numeroDocumento}</span>
                )}
              </div>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${ESTADO_STYLE[cliente.estado] || ESTADO_STYLE.activo}`}>
            {cliente.estado}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Información General
        </button>
        <button
          onClick={() => setActiveTab('expedientes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'expedientes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderOpen className="h-4 w-4" /> Expedientes ({expedientes.length})
        </button>
        <button
          onClick={() => setActiveTab('pagos')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pagos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <DollarSign className="h-4 w-4" /> Pagos ({pagos.length})
        </button>
      </div>

      {/* Contenido */}
      {activeTab === 'expedientes' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Expedientes asociados</h2>
            <Link href="/expedientes/nuevo" className="text-sm font-medium text-blue-600 hover:underline">
              + Nuevo expediente
            </Link>
          </div>
          {expedientes.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Este cliente aún no tiene expedientes asociados.</p>
          ) : (
            <div className="space-y-3">
              {expedientes.map(e => (
                <Link
                  key={e.id}
                  href={`/expedientes/${e.id}`}
                  className="block rounded-lg border border-slate-100 bg-slate-50 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {e.numero_carpeta_fiscal || e.numero_expediente_judicial || 'Sin número'}
                      </h3>
                      {e.delito && <p className="text-sm text-slate-600">{e.delito}</p>}
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        {e.etapa_procesal && <span>{e.etapa_procesal}</span>}
                        {e.juzgado && <span>{e.juzgado}</span>}
                        {e.fiscalia && <span>{e.fiscalia}</span>}
                      </div>
                    </div>
                    {Number(e.gastos_total) > 0 && (
                      <span className="rounded bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700">
                        Gastos: S/ {Number(e.gastos_total).toFixed(2)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pagos' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Facturado</p>
              <p className="text-2xl font-bold text-slate-900">S/ {stats.totalFacturado.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-600 font-medium">Total Pagado</p>
              <p className="text-2xl font-bold text-green-700">S/ {stats.totalPagado.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-600 font-medium">Pendiente</p>
              <p className="text-2xl font-bold text-rose-700">S/ {stats.pendiente.toFixed(2)}</p>
            </div>
          </div>

          {pagos.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Sin pagos registrados aún.</p>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Concepto</th>
                  <th className="px-4 py-3 font-semibold">Expediente</th>
                  <th className="px-4 py-3 font-semibold">Monto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagos.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString('es-PE')}</td>
                    <td className="px-4 py-3">{p.concepto || '—'}</td>
                    <td className="px-4 py-3 text-xs">{p.numero_carpeta_fiscal || p.numero_expediente_judicial || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.moneda || 'S/'} {Number(p.monto).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium capitalize ${PAGO_ESTADO[p.estado] || PAGO_ESTADO.pendiente}`}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Datos de contacto</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Documento:</span>{' '}
              {cliente.numeroDocumento ? `${cliente.tipoDocumento?.toUpperCase()} ${cliente.numeroDocumento}` : '—'}
            </div>
            <div>
              <span className="text-slate-500">Teléfono:</span> {cliente.telefono || '—'}
            </div>
            <div>
              <span className="text-slate-500">Email:</span> {cliente.email || '—'}
            </div>
            <div>
              <span className="text-slate-500">Dirección:</span>{' '}
              {cliente.direccion ? <span className="inline-flex items-center gap-1"><MapPin size={12} /> {cliente.direccion}</span> : '—'}
            </div>
            <div>
              <span className="text-slate-500">Fuente:</span> {cliente.fuente || '—'}
            </div>
            <div>
              <span className="text-slate-500">Alta en sistema:</span> {new Date(cliente.createdAt).toLocaleDateString('es-PE')}
            </div>
          </div>
          {cliente.notas && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Notas</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line">{cliente.notas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
