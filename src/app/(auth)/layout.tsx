export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Verioska Legal</h1>
          <p className="mt-2 text-sm text-slate-400">Centro de Mando Procesal Penal</p>
        </div>
        <div className="rounded-xl bg-white p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}
