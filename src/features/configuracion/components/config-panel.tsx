'use client'

import { useState } from 'react'
import { Bell, HardDrive, Shield, Palette, FileText, Link as LinkIcon } from 'lucide-react'
import { NotificacionesTab } from './tabs/notificaciones-tab'
import { AlmacenamientoTab } from './tabs/almacenamiento-tab'
import { SeguridadTab } from './tabs/seguridad-tab'
import { PreferenciasTab } from './tabs/preferencias-tab'
import { PlantillasTab } from './tabs/plantillas-tab'
import { IntegracionesTab } from './tabs/integraciones-tab'

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
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar de Configuración */}
      <div className="lg:w-64 lg:shrink-0">
        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:w-full ${
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
      </div>

      {/* Contenido de la pestaña */}
      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {activeTab === 'notificaciones' && <NotificacionesTab />}
        {activeTab === 'almacenamiento' && <AlmacenamientoTab />}
        {activeTab === 'seguridad' && <SeguridadTab />}
        {activeTab === 'preferencias' && <PreferenciasTab />}
        {activeTab === 'plantillas' && <PlantillasTab />}
        {activeTab === 'integraciones' && <IntegracionesTab />}
      </div>
    </div>
  )
}
