import { Sidebar } from '@/shared/components/sidebar'
import { BuscadorGlobal } from '@/shared/components/buscador-global'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 antialiased">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 lg:p-12 relative z-0">
        <div className="mx-auto max-w-6xl">
          {/* Barra superior con buscador */}
          <div className="mb-6 flex justify-end">
            <BuscadorGlobal />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
