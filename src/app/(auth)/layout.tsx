import { Scale } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 antialiased">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verioska Legal</h1>
          <p className="mt-1 text-sm text-slate-500">Plataforma de gestión procesal</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
