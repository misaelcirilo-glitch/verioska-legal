export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1326] antialiased">
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#dae2fd] tracking-tight">Verioska</h1>
          <p className="mt-2 text-[0.75rem] uppercase tracking-widest text-[#e9c176]">The Sovereign Ledger</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(69,70,77,0.2)] bg-[#131b2e] p-8 shadow-[0_30px_60px_rgba(6,14,32,0.6)] backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/5 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
