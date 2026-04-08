'use client'

import { useState } from 'react'
import { Bell, HardDrive, Shield, Palette, FileText, Link as LinkIcon } from 'lucide-react'

const TABS = [
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'almacenamiento', label: 'Almacenamiento', icon: HardDrive },
  { id: 'seguridad', label: 'Seguridad y Permisos', icon: Shield },
  { id: 'preferencias', label: 'Preferencias', icon: Palette },
  { id: 'plantillas', label: 'Plantillas', icon: FileText },
  { id: 'integraciones', label: 'Integraciones', icon: LinkIcon },
]

export function ConfigPanel() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)

  return (
    <div className="flex gap-8">
      {/* Sidebar de Configuración */}
      <div className="w-64 shrink-0 space-y-1">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenido de la pestaña */}
      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {activeTab === 'notificaciones' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Notificaciones</h2>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-700">Alertas de Vencimiento</p>
                  <p className="text-sm text-slate-500">Recibir avisos de plazos de expedientes y audiencias</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-700">Sincronización por Email</p>
                  <p className="text-sm text-slate-500">Enviar alertas a tu correo principal</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'almacenamiento' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Almacenamiento (Pro)</h2>
            <div className="mb-6 rounded-lg border border-slate-200 p-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">32 GB usados de 100 GB</span>
                <span className="text-slate-500">32%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: '32%' }}></div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Aquí podrás ver y eliminar archivos pesados vinculados a tus expedientes.
            </p>
          </div>
        )}

        {activeTab === 'seguridad' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Seguridad y Permisos</h2>
            <p className="mb-6 text-sm text-slate-500">
              Los usuarios se gestionan desde "Mi Despacho". Aquí puedes configurar tu propia seguridad.
            </p>
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cambiar Contraseña
            </button>
          </div>
        )}

        {(activeTab === 'preferencias' || activeTab === 'plantillas' || activeTab === 'integraciones') && (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-center">
            <p className="font-medium text-slate-500">Próximamente</p>
            <p className="text-sm text-slate-400">Esta sección estará disponible en la próxima versión.</p>
          </div>
        )}
      </div>
    </div>
  )
}
