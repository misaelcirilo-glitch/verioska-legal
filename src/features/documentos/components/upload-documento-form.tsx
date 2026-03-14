'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText, Image, Music, Video } from 'lucide-react'

const TIPOS_DOCUMENTO = [
  { value: 'declaracion_ministerial', label: 'Declaración Ministerial' },
  { value: 'declaracion_judicial', label: 'Declaración Judicial' },
  { value: 'ampliacion_declaracion', label: 'Ampliación de Declaración' },
  { value: 'peritaje', label: 'Peritaje' },
  { value: 'dictamen', label: 'Dictamen' },
  { value: 'acta_circunstanciada', label: 'Acta Circunstanciada' },
  { value: 'informe_policial', label: 'Informe Policial' },
  { value: 'cadena_custodia', label: 'Cadena de Custodia' },
  { value: 'constancia', label: 'Constancia' },
  { value: 'acuerdo_juez', label: 'Acuerdo de Juez' },
  { value: 'fotografia_evidencia', label: 'Fotografía de Evidencia' },
  { value: 'audio_audiencia', label: 'Audio de Audiencia' },
  { value: 'video_audiencia', label: 'Video de Audiencia' },
  { value: 'otro', label: 'Otro' },
]

const ETAPAS = [
  { value: 'investigacion_inicial', label: 'Investigación Inicial' },
  { value: 'investigacion_complementaria', label: 'Inv. Complementaria' },
  { value: 'intermedia', label: 'Intermedia' },
  { value: 'juicio_oral', label: 'Juicio Oral' },
  { value: 'ejecucion', label: 'Ejecución' },
  { value: 'amparo', label: 'Amparo' },
  { value: 'apelacion', label: 'Apelación' },
]

interface Props {
  expedienteId: string
  etapaActual: string
}

export function UploadDocumentoForm({ expedienteId, etapaActual }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [etapaProcesal, setEtapaProcesal] = useState(etapaActual)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function getFileIcon(file: File) {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />
    if (file.type.startsWith('audio/')) return <Music className="h-5 w-5 text-purple-500" />
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5 text-red-500" />
    return <FileText className="h-5 w-5 text-blue-500" />
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('archivo', file)
    if (tipoDocumento) formData.append('tipoDocumento', tipoDocumento)
    if (etapaProcesal) formData.append('etapaProcesal', etapaProcesal)

    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/documentos`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al subir documento')
      }

      setFile(null)
      setTipoDocumento('')
      setOpen(false)
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Upload className="h-4 w-4" /> Subir documento
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-800">Subir documento</span>
        <button type="button" onClick={() => { setOpen(false); setFile(null); setError('') }}>
          <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
        </button>
      </div>

      {/* Drop zone / File input */}
      <div
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-white p-6 hover:border-blue-400"
        onClick={() => fileRef.current?.click()}
      >
        {file ? (
          <div className="flex items-center gap-2">
            {getFileIcon(file)}
            <span className="text-sm font-medium text-slate-700">{file.name}</span>
            <span className="text-xs text-slate-400">({formatSize(file.size)})</span>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-blue-400" />
            <p className="text-sm text-slate-500">Click para seleccionar archivo</p>
            <p className="text-xs text-slate-400">PDF, imagen, audio o video (máx 50MB)</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.ogg,.mp4"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Tipo de documento</label>
          <select
            value={tipoDocumento}
            onChange={e => setTipoDocumento(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Sin clasificar</option>
            {TIPOS_DOCUMENTO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Etapa procesal</label>
          <select
            value={etapaProcesal}
            onChange={e => setEtapaProcesal(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Sin etapa</option>
            {ETAPAS.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Subiendo...' : 'Subir documento'}
      </button>
    </form>
  )
}
