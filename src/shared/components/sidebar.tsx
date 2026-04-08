'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Clock,
  LogOut,
  Scale,
  Users,
  BookOpen,
  Building2,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expedientes', label: 'Expedientes', icon: FolderOpen },
  { href: '/audiencias', label: 'Audiencias', icon: Calendar },
  { href: '/plazos', label: 'Plazos', icon: Clock },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/jurisprudencia', label: 'Jurisprudencia', icon: BookOpen },
  { href: '/equipo', label: 'Mi Despacho', icon: Building2 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

interface UserData {
  nombre: string
  apellidos: string
  email: string
  rol: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.data) setUser(d.data) })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="relative z-10 flex h-full w-72 flex-col border-r border-[#2d3449]/50 bg-[rgba(19,27,46,0.7)] backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[#2d3449]/30 px-8 py-8">
        <Scale className="h-8 w-8 text-[#e9c176]" />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#dae2fd]">Verioska</h1>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#bdc8d3]">The Sovereign Ledger</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-5 py-8">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-[#222a3d] to-[#131b2e] text-[#e9c176] shadow-lg shadow-black/20 border border-[rgba(233,193,118,0.1)]'
                  : 'text-[#c6c6cd] hover:bg-[#131b2e]/50 hover:text-[#dae2fd]'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-[#e9c176]' : 'text-[#bdc8d3]'}`} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-[#2d3449]/30 px-6 py-6 pb-8">
        {user && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-[#dae2fd] truncate shadow-sm">
              {user.nombre} {user.apellidos}
            </p>
            <p className="text-xs text-[#bdc8d3] truncate mt-0.5">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-[#c6c6cd] transition-colors hover:text-[#e9c176]"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
