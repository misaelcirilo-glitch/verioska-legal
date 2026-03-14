import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Verioska Legal | Centro de Mando Procesal',
  description: 'Copiloto legal para litigación penal en México y Perú',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
