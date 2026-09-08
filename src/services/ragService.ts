import { search } from './retrievalService.js';
import { generateAnswer } from './generationService.js';

const MAX_WORDS = 600;

// Truncamos un texto a un número máximo de palabras.
function truncateText(text: string, maxWords: number): string {
  return text.split(' ').slice(0, maxWords).join(' ');
}

//Responde una pregunta usando RAG
export async function askQuestion(query: string): Promise<string> {
  // Fail fast: validar query vacía
  if (query.trim().length === 0) {
    throw new Error('La consulta no puede estar vacía');
  }

  // Buscar documentos similares
  const results = await search(query);

  // Si no hay documentos embebidos, nada.
  if (results.length === 0) {
    throw new Error(
      'No hay documentos embebidos. Ejecuta la opción 1 primero.',
    );
  }

  // Tomar solo el documento más similar (top-1)
  // En versiones más top podriamos poner un margen e incluir los que superen el umbral o algo asi.
  // Pero pa un ejemplo nos sirve esto.
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
