import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id, docId } = await params

    // Verify ownership and get document
    const doc = await queryOne<{
      ruta_archivo: string; nombre_archivo: string; tipo_archivo: string
    }>(
      `SELECT d.ruta_archivo, d.nombre_archivo, d.tipo_archivo
       FROM documentos d
       JOIN expedientes e ON e.id = d.expediente_id
       WHERE d.id = $1 AND d.expediente_id = $2 AND e.user_id = $3`,
      [docId, id, session.userId]
    )

    if (!doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    const filePath = join(process.cwd(), doc.ruta_archivo)
    const fileBuffer = await readFile(filePath)

    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      imagen: 'image/jpeg',
      audio: 'audio/mpeg',
      video: 'video/mp4',
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentTypes[doc.tipo_archivo] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${doc.nombre_archivo}"`,
      },
    })
  } catch (error) {
    console.error('GET archivo error:', error)
    return NextResponse.json({ error: 'Error al leer archivo' }, { status: 500 })
  }
}
