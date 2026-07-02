import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Scale, BookOpen } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { obtenerJurisprudenciaPorId } from '@/features/jurisprudencia/services/catalogo-jurisprudencia'

export default async function JurisprudenciaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const j = obtenerJurisprudenciaPorId(id)
  if (!j) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/jurisprudencia" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Jurisprudencia
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Scale className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-semibold text-indigo-600">{j.numeroTesis}</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">{j.organo}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${j.pais === 'PE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {j.pais === 'PE' ? '🇵🇪 Perú' : '🇲🇽 México'}
          </span>
          {j.relevancia === 'alta' && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">Relevante</span>
          )}
        </div>

        <h1 className="mb-4 text-xl font-bold leading-snug text-gray-900">{j.rubro}</h1>

        <div className="mb-5 flex items-center gap-2 text-xs text-gray-400">
          <BookOpen className="h-3.5 w-3.5" />
          {j.epoca} · Publicado: {j.fechaPublicacion}
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{j.texto}</p>
        </div>

        {j.temas.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Temas</p>
            <div className="flex flex-wrap gap-1.5">
              {j.temas.map(t => (
                <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{t}</span>
              ))}
            </div>
          </div>
        )}

        {j.delitosRelacionados.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Delitos relacionados</p>
            <div className="flex flex-wrap gap-1.5">
              {j.delitosRelacionados.map(d => (
                <span key={d} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-600">{d}</span>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
          Síntesis curada por Verioska Legal con fines orientativos. Verifica el texto oficial en la fuente correspondiente ({j.organo}).
        </p>
      </div>
    </div>
  )
}
