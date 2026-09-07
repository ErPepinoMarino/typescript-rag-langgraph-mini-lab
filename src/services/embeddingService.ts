//Creamos el servicio de embeddings usando el modelo text-embedding-3-small
import openai from '../lib/openai.js';
import type { Document, EmbedResult } from '../rag/types.js';
import {
  saveEmbeddedDocuments,
  loadEmbeddedDocuments,
  getEmbeddedDocIds,
} from './storage.js';

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error('OpenAI fallo miserablemente al generar el embedding.');
  }
  return embedding;
}
// Embebemos los documentos.
// Lanza un error si no puede completar el proceso.
export async function embedDocuments(docs: Document[]): Promise<EmbedResult> {
  const embeddedIds = await getEmbeddedDocIds();
  const existingDocs = await loadEmbeddedDocuments();
  const docsToEmbed = docs.filter((doc) => !embeddedIds.has(doc.id));

  // Si todos ya están embebidos, retornar los existentes (no es error)
  if (docsToEmbed.length === 0) {
    return {
      allDocs: existingDocs,
      newCount: 0,
      skippedCount: existingDocs.length,
    };
  }

  // Intentar embeber - si falla, lanzar error
  const newEmbeddedDocs = await Promise.all(
    docsToEmbed.map(async (doc) => {
      const embedding = await getEmbedding(doc.text);
      return { ...doc, embedding };
    }),
  );

  const allDocs = [...existingDocs, ...newEmbeddedDocs];

  // Intentar guardar - si falla, lanzar error
  await saveEmbeddedDocuments(allDocs);

  return {
    allDocs,
    newCount: newEmbeddedDocs.length,
    skippedCount: existingDocs.length,
  };
}
