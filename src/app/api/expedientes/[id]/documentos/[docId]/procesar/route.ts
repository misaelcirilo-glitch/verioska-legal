import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { extractTextFromFile } from '@/features/documentos/services/ocr'
import { extraerEntidades, generarHechos } from '@/features/documentos/services/extractor-entidades'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id, docId } = await params

    // Verificar propiedad y obtener documento
    const doc = await queryOne<{
      id: string; ruta_archivo: string; tipo_archivo: string
      procesado: boolean; nombre_archivo: string
    }>(
      `SELECT d.id, d.ruta_archivo, d.tipo_archivo, d.procesado, d.nombre_archivo
       FROM documentos d
       JOIN expedientes e ON e.id = d.expediente_id
       WHERE d.id = $1 AND d.expediente_id = $2 AND e.user_id = $3`,
      [docId, id, session.userId]
    )

    if (!doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    if (doc.procesado) {
      return NextResponse.json({ error: 'Documento ya procesado' }, { status: 400 })
    }

    // Solo procesamos imágenes y PDFs
    if (doc.tipo_archivo !== 'imagen' && doc.tipo_archivo !== 'pdf') {
      return NextResponse.json(
        { error: 'Solo se puede procesar OCR en imágenes y PDFs' },
        { status: 400 }
      )
    }

    // 1. Extraer texto con OCR
    const textoExtraido = await extractTextFromFile(doc.ruta_archivo)

    // 2. Extraer entidades del texto
    const entidades = extraerEntidades(textoExtraido)

    // 3. Generar hechos a partir de entidades
    const hechosExtraidos = generarHechos(textoExtraido, entidades)

    // 4. Guardar texto y entidades en documento
    await queryOne(
      `UPDATE documentos
       SET procesado = TRUE, texto_extraido = $1, metadata = $2
       WHERE id = $3`,
      [textoExtraido, JSON.stringify({ entidades }), docId]
    )

    // 5. Insertar hechos en BD
    const hechosInsertados = []
    for (const hecho of hechosExtraidos) {
      const row = await queryOne(
        `INSERT INTO hechos (
          expediente_id, documento_id, descripcion, fecha_hecho, lugar, relevancia
        ) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [id, docId, hecho.descripcion, hecho.fecha, hecho.lugar, hecho.relevancia]
      )
      hechosInsertados.push(row)
    }

    return NextResponse.json({
      data: {
        id: docId,
        textoExtraido,
        procesado: true,
        entidades,
        hechosCreados: hechosInsertados.length,
      },
    })
  } catch (error) {
    console.error('POST procesar OCR error:', error)
    return NextResponse.json({ error: 'Error al procesar documento' }, { status: 500 })
  }
}
