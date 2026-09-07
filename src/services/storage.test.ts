import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { EmbeddedDocument } from '../rag/types.js';

// Mock del módulo fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

import { readFile, writeFile, mkdir } from 'fs/promises';
import { saveEmbeddedDocuments, loadEmbeddedDocuments, getEmbeddedDocIds } from './storage.js';

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveEmbeddedDocuments', () => {
    it('debe crear el directorio data/ si no existe', async () => {
      const mockMkdir = vi.mocked(mkdir);
      mockMkdir.mockResolvedValue(undefined);

      const mockWriteFile = vi.mocked(writeFile);
      mockWriteFile.mockResolvedValue(undefined);

      const docs: EmbeddedDocument[] = [{ id: 'test', text: 'hola', embedding: [0.1] }];
      await saveEmbeddedDocuments(docs);

      expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining('data'), { recursive: true });
      expect(mockWriteFile).toHaveBeenCalledOnce();
    });

    it('debe guardar documentos en formato JSON', async () => {
      const mockWriteFile = vi.mocked(writeFile);
      mockWriteFile.mockResolvedValue(undefined);

      const docs: EmbeddedDocument[] = [
        { id: 'doc1', text: 'texto uno', embedding: [0.1, 0.2] },
        { id: 'doc2', text: 'texto dos', embedding: [0.3, 0.4] },
      ];

      await saveEmbeddedDocuments(docs);

      expect(mockWriteFile).toHaveBeenCalledOnce();
      const callArgs = mockWriteFile.mock.calls[0];
      if (callArgs) {
        const jsonContent = callArgs[1] as string;
        const parsed = JSON.parse(jsonContent);
        expect(parsed).toHaveLength(2);
        expect(parsed[0].id).toBe('doc1');
      }
    });
  });

  describe('loadEmbeddedDocuments', () => {
    it('debe retornar array vacío si no existe el archivo', async () => {
      const mockReadFile = vi.mocked(readFile);
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);

      const result = await loadEmbeddedDocuments();

      expect(result).toEqual([]);
    });

    it('debe lanzar error si el JSON está corrupto', async () => {
      const mockReadFile = vi.mocked(readFile);
      mockReadFile.mockResolvedValue('json corrupto');

      await expect(loadEmbeddedDocuments()).rejects.toThrow('Error al cargar documentos embebidos');
    });

    it('debe cargar documentos guardados previamente', async () => {
      const docs = [
        { id: 'doc1', text: 'texto uno', embedding: [0.1, 0.2] },
        { id: 'doc2', text: 'texto dos', embedding: [0.3, 0.4] },
      ];

      const mockReadFile = vi.mocked(readFile);
      mockReadFile.mockResolvedValue(JSON.stringify(docs));

      const result = await loadEmbeddedDocuments();

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('doc1');
      expect(result[1]?.id).toBe('doc2');
    });
  });

  describe('getEmbeddedDocIds', () => {
    it('debe retornar Set vacío si no hay documentos', async () => {
      const mockReadFile = vi.mocked(readFile);
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);

      const result = await getEmbeddedDocIds();

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('debe retornar IDs de documentos embebidos', async () => {
      const docs = [
        { id: 'rag', text: 'contenido rag', embedding: [0.1] },
        { id: 'typescript', text: 'contenido ts', embedding: [0.2] },
      ];

      const mockReadFile = vi.mocked(readFile);
      mockReadFile.mockResolvedValue(JSON.stringify(docs));

      const result = await getEmbeddedDocIds();

      expect(result.size).toBe(2);
      expect(result.has('rag')).toBe(true);
      expect(result.has('typescript')).toBe(true);
    });
  });
});
