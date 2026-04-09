import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

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

    // Verify ownership and get document URL
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

    // Si es URL absoluta (Vercel Blob), redirigir
    if (doc.ruta_archivo.startsWith('http')) {
      return NextResponse.redirect(doc.ruta_archivo)
    }

    // Compatibilidad con archivos antiguos en filesystem (solo dev local)
    try {
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      const filePath = join(process.cwd(), doc.ruta_archivo)
      const fileBuffer = await readFile(filePath)

      const contentTypes: Record<string, string> = {
        pdf: 'application/pdf',
        imagen: 'image/jpeg',
        audio: 'audio/mpeg',
        video: 'video/mp4',
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentTypes[doc.tipo_archivo] || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${doc.nombre_archivo}"`,
        },
      })
    } catch {
      return NextResponse.json({ error: 'Archivo no disponible' }, { status: 404 })
    }
  } catch (error) {
    console.error('GET archivo error:', error)
    return NextResponse.json({ error: 'Error al leer archivo' }, { status: 500 })
  }
}
