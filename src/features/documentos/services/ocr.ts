import { createWorker, Worker } from 'tesseract.js'
import { readFile } from 'fs/promises'
import { join } from 'path'

let workerInstance: Worker | null = null

async function getWorker(): Promise<Worker> {
  if (!workerInstance) {
    workerInstance = await createWorker('spa')
  }
  return workerInstance
}

export async function extractTextFromFile(rutaArchivo: string): Promise<string> {
  const fullPath = join(process.cwd(), rutaArchivo)
  const buffer = await readFile(fullPath)
  const worker = await getWorker()
  const { data: { text } } = await worker.recognize(buffer)
  return text.trim()
}

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const worker = await getWorker()
  const { data: { text } } = await worker.recognize(buffer)
  return text.trim()
}

export async function terminateWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate()
    workerInstance = null
  }
}
