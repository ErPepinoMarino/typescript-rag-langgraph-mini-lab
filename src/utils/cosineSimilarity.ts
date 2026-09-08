/*
  Calcula el producto punto (dot product) entre dos vectores.
  Pura matemática, gracias agente.
 */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i];
    const bVal = b[i];
    if (aVal !== undefined && bVal !== undefined) {
      sum += aVal * bVal;
    }
  }
  return sum;
}

/*
  Calcula la norma (magnitud) de un vector.
 */
function norm(v: number[]): number {
  let sumOfSquares = 0;
  for (let i = 0; i < v.length; i++) {
    const val = v[i];
    if (val !== undefined) {
      sumOfSquares += Math.pow(val, 2);
    }
  }
  return Math.sqrt(sumOfSquares);
}

/*
  Calcula la similitud del coseno entre dos vectores (embeddings).
  Aplicammos ya la formula.
  La fórmula es: dotProduct(a, b) / (||a|| × ||b||)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Los vectores deben tener la misma dimensión');
  }

  if (a.length === 0) {
    throw new Error('Los vectores no pueden estar vacíos');
  }

  const normA = norm(a);
  const normB = norm(b);

  if (normA === 0 || normB === 0) {
    throw new Error(
      'No se puede calcular la similitud del coseno con vectores cero',
    );
  }

  return dotProduct(a, b) / (normA * normB);
}
