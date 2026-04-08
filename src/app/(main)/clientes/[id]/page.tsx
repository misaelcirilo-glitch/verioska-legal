'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, Mail, FolderOpen, DollarSign, ArrowLeft } from 'lucide-react'

// Simularemos los datos hasta que creemos la API real
export default function ClienteDetallePage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<'info' | 'expedientes' | 'pagos'>('expedientes')

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/clientes" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        Volver a Clientes
      </Link>

      {/* Header Cliente */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-700">
              <User />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Juan Pérez Sánchez</h1>
              <div className="mt-2 flex gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> 999 123 4567</span>
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> juan.perez@email.com</span>
              </div>
            </div>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
            Activo
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
          <FolderOpen className="h-4 w-4" /> Expedientes (2)
        </button>
        <button
          onClick={() => setActiveTab('pagos')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pagos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <DollarSign className="h-4 w-4" /> Pagos & Cuenta
        </button>
      </div>

      {/* Contenido */}
      {activeTab === 'expedientes' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Expedientes Abiertos</h2>
            <Link href="/expedientes/nuevo" className="text-sm font-medium text-blue-600 hover:underline">
              + Vincular Nuevo
            </Link>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-800">Carpeta Fiscal: 1234-2026</h3>
              <p className="text-sm text-slate-500">Delito: Robo Agravado - Investigación Preparatoria</p>
              <div className="mt-3 text-sm text-rose-600 font-medium bg-rose-50 border border-rose-200 p-2 rounded w-max">
                Gasto pendiente en expediente: S/ 250.00 (Copias y Peritajes)
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pagos' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Facturado</p>
              <p className="text-2xl font-bold text-slate-900">S/ 5,000.00</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-green-50 p-4">
              <p className="text-sm text-green-600 font-medium">Total Pagado</p>
              <p className="text-2xl font-bold text-green-700">S/ 2,000.00</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-600 font-medium">Deuda Pendiente</p>
              <p className="text-2xl font-bold text-rose-700">S/ 3,000.00</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Historial de Pagos</h3>
              <button className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                Registrar Pago
              </button>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3">Expediente</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3">15 Mar 2026</td>
                  <td className="px-4 py-3">Honorarios Iniciales</td>
                  <td className="px-4 py-3">1234-2026</td>
                  <td className="px-4 py-3 font-medium text-slate-900">S/ 2,000.00</td>
                  <td className="px-4 py-3"><span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Pagado</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">01 Abr 2026</td>
                  <td className="px-4 py-3">Audiencia Control</td>
                  <td className="px-4 py-3">1234-2026</td>
                  <td className="px-4 py-3 font-medium text-slate-900">S/ 3,000.00</td>
                  <td className="px-4 py-3"><span className="rounded bg-rose-100 px-2 py-1 text-xs text-rose-700">Pendiente</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Datos de Contacto</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Documento:</span> DNI 12345678</div>
            <div><span className="text-slate-500">Dirección:</span> Av. Principal 123, Lima</div>
            <div><span className="text-slate-500">Alta en sistema:</span> 15 Mar 2026</div>
          </div>
        </div>
      )}
    </div>
  )
}
