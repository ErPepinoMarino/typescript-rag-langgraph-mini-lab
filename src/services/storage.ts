import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { EmbeddedDocument } from '../rag/types.js';

//Usamos process.cwd para calculare correctamente la ruta tanto en desarrollo como en produccion
const DATA_DIR = join(process.cwd(), 'data');
const EMBEDDINGS_FILE = join(DATA_DIR, 'embeddings.json');

// Asegura que el directorio data/ exista.
async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

//Guardado (Setter)
export async function saveEmbeddedDocuments(
  docs: EmbeddedDocument[],
): Promise<void> {
  await ensureDataDir();
  const json = JSON.stringify(docs, null, 2);
  await writeFile(EMBEDDINGS_FILE, json, 'utf-8');
}

// Cargado (Getter)
// Carga el json entero y va extrayendo todos los embedded documents, por eso devuelve un array
export async function loadEmbeddedDocuments(): Promise<EmbeddedDocument[]> {
  try {
    const json = await readFile(EMBEDDINGS_FILE, 'utf-8');
    return JSON.parse(json) as EmbeddedDocument[];
  } catch (error) {
    // Si el archivo no existe, es primera ejecución → retornar vacío
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    // Cualquier otro error (JSON corrupto, permisos, etc.) → lanzar
    throw new Error(`Error al cargar documentos embebidos`, { cause: error });
  }
}

// Obtiene el conjunto de IDs de documentos ya embebidos.
// Repasa la estructura Set en typescript (basicamente elimina dupes)
export async function getEmbeddedDocIds(): Promise<Set<string>> {
  const docs = await loadEmbeddedDocuments();
  return new Set(docs.map((doc) => doc.id));
}
