import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    'SELECT id FROM expedientes WHERE id = $1 AND user_id = $2',
    [expedienteId, userId]
  )
}

const ALLOWED_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'imagen',
  'image/jpg': 'imagen',
  'image/png': 'imagen',
  'image/webp': 'imagen',
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'video/mp4': 'video',
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const VALID_TIPOS_DOCUMENTO = [
  'declaracion_ministerial', 'declaracion_judicial', 'ampliacion_declaracion',
  'peritaje', 'dictamen', 'acta_circunstanciada', 'informe_policial',
  'cadena_custodia', 'constancia', 'acuerdo_juez', 'fotografia_evidencia',
  'audio_audiencia', 'video_audiencia', 'otro',
]

const VALID_ETAPAS = [
  'investigacion_inicial', 'investigacion_complementaria', 'intermedia',
  'juicio_oral', 'ejecucion', 'amparo', 'apelacion',
]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const documentos = await query<{
      id: string; nombre_archivo: string; tipo_archivo: string
      tipo_documento: string | null; etapa_procesal: string | null
      ruta_archivo: string; tamano_bytes: number | null
      procesado: boolean; texto_extraido: string | null
      metadata: Record<string, unknown>; created_at: string
    }>(
      'SELECT * FROM documentos WHERE expediente_id = $1 ORDER BY created_at DESC',
      [id]
    )

    const data = documentos.map(d => ({
      id: d.id,
      nombreArchivo: d.nombre_archivo,
      tipoArchivo: d.tipo_archivo,
      tipoDocumento: d.tipo_documento,
      etapaProcesal: d.etapa_procesal,
      rutaArchivo: d.ruta_archivo,
      tamanoBytes: d.tamano_bytes,
      procesado: d.procesado,
      textoExtraido: d.texto_extraido,
      metadata: d.metadata,
      createdAt: d.created_at,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('GET documentos error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('archivo') as File | null
    const tipoDocumento = formData.get('tipoDocumento') as string | null
    const etapaProcesal = formData.get('etapaProcesal') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 50MB)' }, { status: 400 })
    }

    const tipoArchivo = ALLOWED_EXTENSIONS[file.type]
    if (!tipoArchivo) {
      return NextResponse.json(
        { error: `Tipo de archivo no soportado: ${file.type}` },
        { status: 400 }
      )
    }

    if (tipoDocumento && !VALID_TIPOS_DOCUMENTO.includes(tipoDocumento)) {
      return NextResponse.json({ error: 'Tipo de documento inválido' }, { status: 400 })
    }

    if (etapaProcesal && !VALID_ETAPAS.includes(etapaProcesal)) {
      return NextResponse.json({ error: 'Etapa procesal inválida' }, { status: 400 })
    }

    // Subir a Vercel Blob (filesystem en serverless es read-only)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const blobPath = `expedientes/${id}/${randomUUID()}-${safeName}`

    let blobUrl: string
    try {
      const blob = await put(blobPath, file, {
        access: 'public',
        addRandomSuffix: false,
        contentType: file.type,
      })
      blobUrl = blob.url
    } catch (uploadErr) {
      console.error('Vercel Blob upload error:', uploadErr)
      return NextResponse.json(
        { error: 'No se pudo subir el archivo. Verifica que BLOB_READ_WRITE_TOKEN esté configurado en Vercel.' },
        { status: 500 }
      )
    }

    // Save to database
    const documento = await queryOne(
      `INSERT INTO documentos (
        expediente_id, nombre_archivo, tipo_archivo, tipo_documento,
        etapa_procesal, ruta_archivo, tamano_bytes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        id, file.name, tipoArchivo, tipoDocumento || null,
        etapaProcesal || null, blobUrl, file.size,
      ]
    )

    return NextResponse.json({ data: documento }, { status: 201 })
  } catch (error) {
    console.error('POST documento error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error interno del servidor' }, { status: 500 })
  }
}
