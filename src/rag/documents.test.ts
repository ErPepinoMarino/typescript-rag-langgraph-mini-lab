import { describe, expect, it } from 'vitest';
import { loadDocuments } from './documents.js';
import type { Document } from './types.js';

describe('loadDocuments', () => {
  it('debe retornar un array de documentos', async () => {
    const documents = await loadDocuments();
    expect(Array.isArray(documents)).toBe(true);
    expect(documents.length).toBeGreaterThan(0);
  });

  it('cada documento debe tener id y text', async () => {
    const documents = await loadDocuments();
    for (const doc of documents) {
      expect(doc).toHaveProperty('id');
      expect(doc).toHaveProperty('text');
      expect(typeof doc.id).toBe('string');
      expect(typeof doc.text).toBe('string');
    }
  });

  it('el id debe ser el nombre del archivo sin extensión .md', async () => {
    const documents = await loadDocuments();
    const ids = documents.map((doc) => doc.id);

    // Verificar que los ids no tienen extensión
    for (const id of ids) {
      expect(id.endsWith('.md')).toBe(false);
    }

    // Verificar que hay documentos esperados
    expect(ids).toContain('rag');
    expect(ids).toContain('typescript');
    expect(ids).toContain('langgraph');
  });

  it('el text debe contener contenido no vacío', async () => {
    const documents = await loadDocuments();
    for (const doc of documents) {
      expect(doc.text.length).toBeGreaterThan(0);
    }
  });

  it('debe cumplir con la interfaz Document', async () => {
    const documents = await loadDocuments();
    const firstDoc = documents[0];
    if (firstDoc) {
      // Verificar que cumple con la estructura de Document
      const doc: Document = firstDoc;
      expect(doc.id).toBeDefined();
      expect(doc.text).toBeDefined();
    }
  });
});
