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
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expedientes', label: 'Expedientes', icon: FolderOpen },
  { href: '/audiencias', label: 'Audiencias', icon: Calendar },
  { href: '/plazos', label: 'Plazos', icon: Clock },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/jurisprudencia', label: 'Jurisprudencia', icon: BookOpen },
  { href: '/equipo', label: 'Mi Despacho', icon: Building2 },
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
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-slate-700 px-6 py-5">
        <Scale className="h-7 w-7 text-blue-400" />
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Verioska</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Centro de Mando</p>
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
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-700 px-4 py-4">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white truncate">
              {user.nombre} {user.apellidos}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
