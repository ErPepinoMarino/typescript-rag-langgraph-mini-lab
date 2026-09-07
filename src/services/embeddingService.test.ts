import { describe, expect, it, vi, beforeEach } from 'vitest';
import { embedDocuments } from './embeddingService.js';
import type { Document } from '../rag/types.js';

// Mock del módulo openai
vi.mock('../lib/openai.js', () => ({
  default: {
    embeddings: {
      create: vi.fn(),
    },
  },
}));

// Mock del módulo storage
vi.mock('./storage.js', () => ({
  saveEmbeddedDocuments: vi.fn(),
  loadEmbeddedDocuments: vi.fn(),
  getEmbeddedDocIds: vi.fn(),
}));

import openai from '../lib/openai.js';
import { saveEmbeddedDocuments, loadEmbeddedDocuments, getEmbeddedDocIds } from './storage.js';

describe('embedDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEmbeddedDocIds).mockResolvedValue(new Set());
    vi.mocked(loadEmbeddedDocuments).mockResolvedValue([]);
    vi.mocked(saveEmbeddedDocuments).mockResolvedValue(undefined);
  });

  it('debe embeber documentos nuevos y guardarlos', async () => {
    const mockCreate = vi.mocked(openai.embeddings.create);
    mockCreate.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    } as never);

    const docs: Document[] = [{ id: 'doc1', text: 'texto uno' }];
    const result = await embedDocuments(docs);

    expect(result.allDocs).toHaveLength(1);
    expect(result.allDocs[0]?.id).toBe('doc1');
    expect(result.allDocs[0]?.embedding).toEqual([0.1, 0.2, 0.3]);
    expect(result.newCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(saveEmbeddedDocuments).toHaveBeenCalledOnce();
  });

  it('debe omitir documentos ya embebidos', async () => {
    const mockCreate = vi.mocked(openai.embeddings.create);
    mockCreate.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    } as never);

    // Simular que doc1 ya está embebido
    vi.mocked(getEmbeddedDocIds).mockResolvedValue(new Set(['doc1']));
    vi.mocked(loadEmbeddedDocuments).mockResolvedValue([
      { id: 'doc1', text: 'existente', embedding: [0.1, 0.2, 0.3] },
    ]);

    const docs: Document[] = [
      { id: 'doc1', text: 'texto uno' },
      { id: 'doc2', text: 'texto dos' },
    ];
    const result = await embedDocuments(docs);

    // Solo debe embeber doc2 (el nuevo)
    expect(mockCreate).toHaveBeenCalledOnce();
    expect(result.allDocs).toHaveLength(2);
    expect(result.newCount).toBe(1);
    expect(result.skippedCount).toBe(1);
  });

  it('debe retornar existentes si todos ya están embebidos', async () => {
    const mockCreate = vi.mocked(openai.embeddings.create);

    vi.mocked(getEmbeddedDocIds).mockResolvedValue(new Set(['doc1', 'doc2']));
    vi.mocked(loadEmbeddedDocuments).mockResolvedValue([
      { id: 'doc1', text: 'uno', embedding: [0.1] },
      { id: 'doc2', text: 'dos', embedding: [0.2] },
    ]);

    const docs: Document[] = [
      { id: 'doc1', text: 'uno' },
      { id: 'doc2', text: 'dos' },
    ];
    const result = await embedDocuments(docs);

    // No debe llamar a la API porque todos ya están embebidos
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result.allDocs).toHaveLength(2);
    expect(result.newCount).toBe(0);
    expect(result.skippedCount).toBe(2);
  });

  it('debe combinar documentos existentes con nuevos', async () => {
    const mockCreate = vi.mocked(openai.embeddings.create);
    mockCreate.mockResolvedValue({
      data: [{ embedding: [0.5, 0.6] }],
    } as never);

    vi.mocked(getEmbeddedDocIds).mockResolvedValue(new Set(['doc1']));
    vi.mocked(loadEmbeddedDocuments).mockResolvedValue([
      { id: 'doc1', text: 'existente', embedding: [0.1, 0.2] },
    ]);

    const docs: Document[] = [
      { id: 'doc1', text: 'existente' },
      { id: 'doc2', text: 'nuevo' },
    ];
    const result = await embedDocuments(docs);

    expect(result.allDocs).toHaveLength(2);
    expect(result.allDocs[0]?.id).toBe('doc1');
    expect(result.allDocs[1]?.id).toBe('doc2');
    expect(result.newCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(saveEmbeddedDocuments).toHaveBeenCalledOnce();
  });

  it('debe retornar conteos vacíos si no hay documentos', async () => {
    const result = await embedDocuments([]);
    expect(result.allDocs).toEqual([]);
    expect(result.newCount).toBe(0);
    expect(result.skippedCount).toBe(0);
  });
});
