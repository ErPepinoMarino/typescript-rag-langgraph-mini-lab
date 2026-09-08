//Posiblemente el helper más chorra del proyecto, preparamos el context.
import type { SearchResult } from '../rag/types.js';

const MAX_WORDS = 600;

function truncateText(text: string, maxWords: number): string {
  return text.split(' ').slice(0, maxWords).join(' ');
}

export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  const topResult = results[0];
  if (!topResult) {
    return '';
  }

  return truncateText(topResult.document.text, MAX_WORDS);
}
