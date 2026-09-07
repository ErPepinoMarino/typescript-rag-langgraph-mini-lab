import { getEmbedding } from './embeddingService.js';
import { loadEmbeddedDocuments } from './storage.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';
import type { SearchResult } from '../rag/types.js';

//Compara el input que le pongamos con nuestros documentos y lo evalua
//Devuelve un array de SearchResult donde vemos la similitud entre nuestrafrase y los documentos (Embeddings)
export async function search(query: string): Promise<SearchResult[]> {
  if (query.trim().length === 0) {
    throw new Error('La consulta no puede estar vacía');
  }

  const queryEmbedding = await getEmbedding(query);
  const documents = await loadEmbeddedDocuments();

  const results: SearchResult[] = documents
    .map((doc) => ({
      document: doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score);

  return results;
}
