'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password,
          nombre: formData.get('nombre'),
          apellidos: formData.get('apellidos'),
          cedulaProfesional: formData.get('cedulaProfesional') || undefined,
          telefono: formData.get('telefono') || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-[rgba(69,70,77,0.3)] bg-[#060e20] text-[#dae2fd] px-3 py-2.5 text-sm focus:border-[#e9c176] focus:outline-none focus:ring-1 focus:ring-[#e9c176] placeholder:text-[#45464d] transition-all"
  const labelClass = "mb-1 block text-[0.8rem] uppercase tracking-wider font-semibold text-[#8a94a2]"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-bold tracking-tight text-[#dae2fd]">Crear Cuenta</h2>

      {error && (
        <div className="rounded-lg bg-[rgba(147,0,10,0.2)] border border-[rgba(147,0,10,0.5)] p-3 text-sm text-[#ffb4ab]">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className={labelClass}>Nombre</label>
          <input id="nombre" name="nombre" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="apellidos" className={labelClass}>Apellidos</label>
          <input id="apellidos" name="apellidos" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="abogado@despacho.com" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className={labelClass}>Contraseña</label>
          <input id="password" name="password" type="password" required minLength={8} className={inputClass} placeholder="••••••••" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>Confirmar</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className={inputClass} placeholder="••••••••" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cedulaProfesional" className={labelClass}>Cédula <span className="text-[#45464d] font-normal lowercase">(opcional)</span></label>
          <input id="cedulaProfesional" name="cedulaProfesional" className={inputClass} />
        </div>
        <div>
          <label htmlFor="telefono" className={labelClass}>Teléfono <span className="text-[#45464d] font-normal lowercase">(opcional)</span></label>
          <input id="telefono" name="telefono" type="tel" className={inputClass} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#172033] to-[#131b2e] border border-[rgba(233,193,118,0.3)] px-4 py-3 text-sm font-bold text-[#e9c176] hover:bg-gradient-to-r hover:from-[#1a243a] hover:to-[#172033] hover:shadow-[0_0_15px_rgba(233,193,118,0.2)] disabled:opacity-50 transition-all uppercase tracking-widest"
      >
        {loading ? 'Inicializando...' : 'Crear Cuenta'}
      </button>

      <p className="text-center text-[0.8rem] text-[#8a94a2] mt-4">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-[#e9c176] hover:text-white transition-colors">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
