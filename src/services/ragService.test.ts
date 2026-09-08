import { describe, expect, it, vi, beforeEach } from 'vitest';
import { askQuestion } from './ragService.js';
import type { SearchResult } from '../rag/types.js';

// Mock del módulo retrievalService
vi.mock('./retrievalService.js', () => ({
  search: vi.fn(),
}));

// Mock del módulo generationService
vi.mock('./generationService.js', () => ({
  generateAnswer: vi.fn(),
}));

import { search } from './retrievalService.js';
import { generateAnswer } from './generationService.js';

describe('askQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe lanzar error si la consulta está vacía', async () => {
    await expect(askQuestion('')).rejects.toThrow(
      'La consulta no puede estar vacía',
    );
    await expect(askQuestion('   ')).rejects.toThrow(
      'La consulta no puede estar vacía',
    );
  });

  it('debe lanzar error si no hay documentos embebidos', async () => {
    const mockSearch = vi.mocked(search);
    mockSearch.mockResolvedValue([]);

    await expect(askQuestion('¿Qué es RAG?')).rejects.toThrow(
      'No hay documentos embebidos. Ejecuta la opción 1 primero.',
    );
  });

  it('debe usar solo el documento más similar (top-1)', async () => {
    const mockSearch = vi.mocked(search);
    const mockGenerate = vi.mocked(generateAnswer);

    const results: SearchResult[] = [
      {
        document: { id: 'doc1', text: 'Texto más similar', embedding: [0.9] },
        score: 0.95,
      },
      {
        document: { id: 'doc2', text: 'Texto menos similar', embedding: [0.5] },
        score: 0.5,
      },
    ];

    mockSearch.mockResolvedValue(results);
    mockGenerate.mockResolvedValue('Respuesta generada');

    await askQuestion('¿Qué es RAG?');

    // Solo debe usar el primer documento (top-1)
    expect(mockGenerate).toHaveBeenCalledOnce();
    const callArgs = mockGenerate.mock.calls[0];
    if (callArgs) {
      const context = callArgs[0];
      expect(context).toContain('Texto más similar');
      expect(context).not.toContain('Texto menos similar');
    }
  });

  it('debe truncar el texto a 600 palabras', async () => {
    const mockSearch = vi.mocked(search);
    const mockGenerate = vi.mocked(generateAnswer);

    // Crear texto con más de 600 palabras
    const longText = Array.from({ length: 700 }, (_, i) => `palabra${i}`).join(
      ' ',
    );

    const results: SearchResult[] = [
      {
        document: { id: 'doc1', text: longText, embedding: [0.9] },
        score: 0.95,
      },
    ];

    mockSearch.mockResolvedValue(results);
    mockGenerate.mockResolvedValue('Respuesta');

    await askQuestion('Pregunta');

    const callArgs = mockGenerate.mock.calls[0];
    if (callArgs) {
      const context = callArgs[0];
      // El contexto debe tener máximo 600 palabras + el prefijo "Responde usando este contexto: "
      const words = context.split(' ');
      expect(words.length).toBeLessThanOrEqual(600 + 5); // 5 palabras del prefijo
    }
  });

  it('debe pasar la pregunta a generateAnswer', async () => {
    const mockSearch = vi.mocked(search);
    const mockGenerate = vi.mocked(generateAnswer);

    const results: SearchResult[] = [
      {
        document: { id: 'doc1', text: 'Contexto', embedding: [0.9] },
        score: 0.95,
      },
    ];

    mockSearch.mockResolvedValue(results);
    mockGenerate.mockResolvedValue('Respuesta');

    const question = '¿Qué es TypeScript?';
    await askQuestion(question);

    const callArgs = mockGenerate.mock.calls[0];
    if (callArgs) {
      expect(callArgs[1]).toBe(question);
    }
  });
});
