import { Sidebar } from '@/shared/components/sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0b1326] text-[#dae2fd] antialiased">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 lg:p-12 relative z-0">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
