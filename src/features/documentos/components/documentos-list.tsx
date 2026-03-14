'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Image, Music, Video, Eye, Clock, Scan, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/shared/components/badge'

interface DocumentoRow {
  id: string
  nombreArchivo: string
  tipoArchivo: string
  tipoDocumento: string | null
  etapaProcesal: string | null
  tamanoBytes: number | null
  procesado: boolean
  textoExtraido: string | null
  createdAt: string
}

const tipoDocLabels: Record<string, string> = {
  declaracion_ministerial: 'Decl. Ministerial',
  declaracion_judicial: 'Decl. Judicial',
  ampliacion_declaracion: 'Amp. Declaración',
  peritaje: 'Peritaje',
  dictamen: 'Dictamen',
  acta_circunstanciada: 'Acta Circunst.',
  informe_policial: 'Informe Policial',
  cadena_custodia: 'Cadena Custodia',
  constancia: 'Constancia',
  acuerdo_juez: 'Acuerdo Juez',
  fotografia_evidencia: 'Foto Evidencia',
  audio_audiencia: 'Audio Audiencia',
  video_audiencia: 'Video Audiencia',
  otro: 'Otro',
}

const etapaLabels: Record<string, string> = {
  investigacion_inicial: 'Inv. Inicial',
  investigacion_complementaria: 'Inv. Compl.',
  intermedia: 'Intermedia',
  juicio_oral: 'Juicio Oral',
  ejecucion: 'Ejecución',
  amparo: 'Amparo',
  apelacion: 'Apelación',
}

function getIcon(tipo: string) {
  switch (tipo) {
    case 'imagen': return <Image className="h-4 w-4 text-green-500" />
    case 'audio': return <Music className="h-4 w-4 text-purple-500" />
    case 'video': return <Video className="h-4 w-4 text-red-500" />
    default: return <FileText className="h-4 w-4 text-blue-500" />
  }
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  documentos: DocumentoRow[]
  expedienteId: string
}

function DocumentoCard({ doc, expedienteId }: { doc: DocumentoRow; expedienteId: string }) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const canProcess = !doc.procesado && (doc.tipoArchivo === 'imagen' || doc.tipoArchivo === 'pdf')

  async function handleProcesar() {
    setProcesando(true)
    setError('')
    try {
      const res = await fetch(
        `/api/expedientes/${expedienteId}/documentos/${doc.id}/procesar`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al procesar')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        {getIcon(doc.tipoArchivo)}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-700">{doc.nombreArchivo}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {doc.tamanoBytes && <span>{formatSize(doc.tamanoBytes)}</span>}
            <span>{new Date(doc.createdAt).toLocaleDateString('es-MX')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.tipoDocumento && (
            <Badge variant="neutral">{tipoDocLabels[doc.tipoDocumento] || doc.tipoDocumento}</Badge>
          )}
          {doc.etapaProcesal && (
            <Badge variant="info">{etapaLabels[doc.etapaProcesal] || doc.etapaProcesal}</Badge>
          )}
          {doc.procesado ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1"
            >
              <Badge variant="success">OCR</Badge>
              {expanded ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
            </button>
          ) : canProcess ? (
            <button
              onClick={handleProcesar}
              disabled={procesando}
              className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50"
            >
              <Scan className="h-3 w-3" />
              {procesando ? 'Procesando...' : 'Procesar'}
            </button>
          ) : (
            <span><Clock className="h-3.5 w-3.5 text-slate-300" /></span>
          )}
          <a
            href={`/api/expedientes/${expedienteId}/documentos/${doc.id}/archivo`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <Eye className="h-4 w-4" />
          </a>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {expanded && doc.textoExtraido && (
        <div className="mt-3 max-h-48 overflow-y-auto rounded border border-slate-200 bg-white p-3">
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{doc.textoExtraido}</p>
        </div>
      )}
    </div>
  )
}

export function DocumentosList({ documentos, expedienteId }: Props) {
  if (documentos.length === 0) {
    return <p className="text-sm text-slate-500">Sin documentos. Sube el primer archivo de la carpeta de investigación.</p>
  }

  return (
    <div className="space-y-2">
      {documentos.map(doc => (
        <DocumentoCard key={doc.id} doc={doc} expedienteId={expedienteId} />
      ))}
    </div>
  )
}
