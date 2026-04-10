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
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Verioska</h1>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">Legal Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 px-4 py-4">
        {user && (
          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user.nombre} {user.apellidos}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-1">{user.rol}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
