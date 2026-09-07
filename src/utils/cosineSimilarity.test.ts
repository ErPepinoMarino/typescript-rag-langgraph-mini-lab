//No he implementado ni uno solo de estos tests.
//Pero sí los he leído.
import { describe, expect, it } from 'vitest';
import { cosineSimilarity } from './cosineSimilarity.js';

describe('cosineSimilarity', () => {
  it('debe retornar 1 para vectores idénticos', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 10);
  });

  it('debe retornar -1 para vectores opuestos', () => {
    const a = [1, 0];
    const b = [-1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 10);
  });

  it('debe retornar 0 para vectores ortogonales', () => {
    const a = [1, 0];
    const b = [0, 1];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 10);
  });

  it('debe calcular correctamente la similitud para vectores 2D', () => {
    const a = [1, 1];
    const b = [1, 0];
    // cos(45°) = √2/2 ≈ 0.7071
    expect(cosineSimilarity(a, b)).toBeCloseTo(Math.sqrt(2) / 2, 10);
  });

  it('debe calcular correctamente la similitud para vectores 3D', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    // dotProduct = 4 + 10 + 18 = 32
    // ||a|| = sqrt(1 + 4 + 9) = sqrt(14)
    // ||b|| = sqrt(16 + 25 + 36) = sqrt(77)
    // cosine = 32 / (sqrt(14) * sqrt(77))
    const expected = 32 / (Math.sqrt(14) * Math.sqrt(77));
    expect(cosineSimilarity(a, b)).toBeCloseTo(expected, 10);
  });

  it('debe funcionar con embeddings de alta dimensión', () => {
    // Simular embeddings como los de OpenAI (1536 dimensiones)
    const a = Array.from({ length: 1536 }, (_, i) => Math.sin(i));
    const b = Array.from({ length: 1536 }, (_, i) => Math.sin(i));
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 10);
  });

  it('debe lanzar error cuando los vectores tienen diferente dimensión', () => {
    const a = [1, 2, 3];
    const b = [1, 2];
    expect(() => cosineSimilarity(a, b)).toThrow(
      'Los vectores deben tener la misma dimensión',
    );
  });

  it('debe lanzar error cuando los vectores están vacíos', () => {
    const a: number[] = [];
    const b: number[] = [];
    expect(() => cosineSimilarity(a, b)).toThrow(
      'Los vectores no pueden estar vacíos',
    );
  });

  it('debe lanzar error cuando uno de los vectores es cero', () => {
    const a = [0, 0, 0];
    const b = [1, 2, 3];
    expect(() => cosineSimilarity(a, b)).toThrow(
      'No se puede calcular la similitud del coseno con vectores cero',
    );
  });

  it('debe lanzar error cuando ambos vectores son cero', () => {
    const a = [0, 0, 0];
    const b = [0, 0, 0];
    expect(() => cosineSimilarity(a, b)).toThrow(
      'No se puede calcular la similitud del coseno con vectores cero',
    );
  });

  it('debe manejar valores negativos correctamente', () => {
    const a = [-1, -2, -3];
    const b = [1, 2, 3];
    // Vectores en direcciones opuestas
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 10);
  });

  it('debe manejar valores decimales correctamente', () => {
    const a = [0.1, 0.2, 0.3];
    const b = [0.4, 0.5, 0.6];
    const dotProduct = 0.1 * 0.4 + 0.2 * 0.5 + 0.3 * 0.6; // 0.32
    const normA = Math.sqrt(0.01 + 0.04 + 0.09); // sqrt(0.14)
    const normB = Math.sqrt(0.16 + 0.25 + 0.36); // sqrt(0.77)
    const expected = dotProduct / (normA * normB);
    expect(cosineSimilarity(a, b)).toBeCloseTo(expected, 10);
  });
});
