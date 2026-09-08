import { describe, expect, it, vi, beforeEach } from 'vitest';
import { search } from './retrievalService.js';
import type { EmbeddedDocument } from '../rag/types.js';

// Mock del módulo embeddingService
vi.mock('./embeddingService.js', () => ({
  getEmbedding: vi.fn(),
}));

// Mock del módulo storage
vi.mock('./storage.js', () => ({
  loadEmbeddedDocuments: vi.fn(),
}));

import { getEmbedding } from './embeddingService.js';
import { loadEmbeddedDocuments } from './storage.js';

describe('search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe lanzar error si la consulta está vacía', async () => {
    await expect(search('')).rejects.toThrow(
      'La consulta no puede estar vacía',
    );
    await expect(search('   ')).rejects.toThrow(
      'La consulta no puede estar vacía',
    );
  });

  it('debe retornar resultados ordenados por similitud', async () => {
    const mockGetEmbedding = vi.mocked(getEmbedding);
    mockGetEmbedding.mockResolvedValue([1, 0, 0]);

    const mockLoad = vi.mocked(loadEmbeddedDocuments);
    mockLoad.mockResolvedValue([
      {
        id: 'doc1',
        text: 'texto sobre gatos',
        embedding: [1, 0, 0], // Muy similar
      },
      {
        id: 'doc2',
        text: 'texto sobre perros',
        embedding: [0, 1, 0], // Poco similar
      },
      {
        id: 'doc3',
        text: 'texto sobre aves',
        embedding: [0.9, 0.1, 0], // Bastante similar
      },
    ] satisfies EmbeddedDocument[]);

    const results = await search('consulta');

    expect(results).toHaveLength(3);
    expect(results[0]?.document.id).toBe('doc1'); // Más similar primero
    expect(results[1]?.document.id).toBe('doc3');
    expect(results[2]?.document.id).toBe('doc2'); // Menos similar último
  });

  it('debe calcular scores entre 0 y 1', async () => {
    const mockGetEmbedding = vi.mocked(getEmbedding);
    mockGetEmbedding.mockResolvedValue([1, 0]);

    const mockLoad = vi.mocked(loadEmbeddedDocuments);
    mockLoad.mockResolvedValue([
      { id: 'doc1', text: 'texto', embedding: [1, 0] },
      { id: 'doc2', text: 'texto', embedding: [0, 1] },
    ] satisfies EmbeddedDocument[]);

    const results = await search('test');

    for (const result of results) {
      expect(result.score).toBeGreaterThanOrEqual(-1);
      expect(result.score).toBeLessThanOrEqual(1);
    }
  });

  it('debe retornar array vacío si no hay documentos', async () => {
    const mockGetEmbedding = vi.mocked(getEmbedding);
    mockGetEmbedding.mockResolvedValue([1, 0, 0]);

    const mockLoad = vi.mocked(loadEmbeddedDocuments);
    mockLoad.mockResolvedValue([]);

    const results = await search('consulta');

    expect(results).toEqual([]);
  });

  it('cada resultado debe tener document y score', async () => {
    const mockGetEmbedding = vi.mocked(getEmbedding);
    mockGetEmbedding.mockResolvedValue([1, 0]);

    const mockLoad = vi.mocked(loadEmbeddedDocuments);
    mockLoad.mockResolvedValue([
      { id: 'doc1', text: 'texto', embedding: [1, 0] },
    ] satisfies EmbeddedDocument[]);

    const results = await search('test');

    expect(results[0]).toHaveProperty('document');
    expect(results[0]).toHaveProperty('score');
    expect(results[0]?.document.id).toBe('doc1');
  });
});
