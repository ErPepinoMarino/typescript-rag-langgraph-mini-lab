import { search } from './retrievalService.js';
import { generateAnswer } from './generationService.js';

const MAX_WORDS = 600;

/**
 * Trunca un texto a un número máximo de palabras.
 * @param text - Texto a truncar
 * @param maxWords - Número máximo de palabras
 * @returns Texto truncado
 */
function truncateText(text: string, maxWords: number): string {
  return text.split(' ').slice(0, maxWords).join(' ');
}

/**
 * Responde una pregunta usando RAG (Retrieval-Augmented Generation).
 * 1. Busca el documento más similar a la pregunta
 * 2. Usa ese documento como contexto para generar una respuesta
 * @param query - Pregunta del usuario
 * @returns Promise<string> Respuesta generada
 * @throws Error si la consulta está vacía o no hay documentos embebidos
 */
export async function askQuestion(query: string): Promise<string> {
  // Fail fast: validar query vacía
  if (query.trim().length === 0) {
    throw new Error('La consulta no puede estar vacía');
  }

  // Buscar documentos similares
  const results = await search(query);

  // Si no hay documentos embebidos, no podemos responder
  if (results.length === 0) {
    throw new Error('No hay documentos embebidos. Ejecuta la opción 1 primero.');
  }

  // Tomar solo el documento más similar (top-1)
  const topResult = results[0];
  if (!topResult) {
    throw new Error('No se encontraron resultados.');
  }

  // Truncar el texto a 600 palabras
  const truncatedText = truncateText(topResult.document.text, MAX_WORDS);

  // Construir contexto y generar respuesta
  const context = `Responde usando este contexto: ${truncatedText}`;
  const answer = await generateAnswer(context, query);

  return answer;
}
