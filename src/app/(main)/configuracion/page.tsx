import { ConfigPanel } from '@/features/configuracion/components/config-panel'

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Configuración</h1>
      <ConfigPanel />
    </div>
  )
}
