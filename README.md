# typescript-rag-langgraph-lab

Proyecto personal de aprendizaje autodidacta para explorar **RAG** y **LangGraph** implementando un pipeline desde cero en TypeScript.

## ¿Qué es esto?

Un CLI interactivo que permite:

1. Embeber documentos de knowledge/
2. Auditar documentos embebidos
3. Probar RAG (buscar similitud)
4. Usar RAG (preguntar al LLM)
5. Testear LangGraph simple
6. Testear LangGraph V2 (con reformulación)
7. Salir

## ¿Cómo se usa?

1. Incluye los archivos que quieras usar para el rag en src/knowledge/ (Importante que estén en formato markdown ".md")
2. Carga los documentos antes de usar el RAG o el LangGraph (El resultado aparecerá en un .json en la carpeta /data)
3. Puedes chequear qué archivos has incluido en tu rag.
4. Elige la opcion que quieras y escribe cualquier cosa.
5. En LangGraph v2 prueba a escribir cosas que no tengan nada que ver y verifica que falla.(también hay retry limitado y condicion de salida)

## Arquitectura RAG

El programa convertirá tu string en un embedding, lo comparará con los embeddings del rag y le pasará el documento más compatible al llm como contexto para responder a tu string.

```
Question
   ↓
Embedding (text-embedding-3-small)
   ↓
Retrieval (cosine similarity)
   ↓
Context (top-1, truncado a 600 palabras)
   ↓
LLM (gpt-4o-mini)
   ↓
Answer
```

## LangGraph V1

La máquina de estados es exactamente la misma que en caso anterior pero gestionada por LangGraph. Caso más sencillo posible.

**LangGraph V1** — orquestado con un grafo:

```
          ┌──────────────────────────────────┐
          │              START               │
          └──────────────┬───────────────────┘
                         ↓
                 ┌───────────────┐
                 │   retrieval   │  search() → buildContext()
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │  generation   │  generateAnswer(context, query)
                 └───────┬───────┘
                         ↓
                ┌─────────────────┐
                │       END       │  retorna el state final
                └─────────────────┘
```

## LangGraph V2

Versión que introduce **conditional edges** y **loops**. Cuando la búsqueda no encuentra contexto relevante, el grafo muestra los temas disponibles y le pide al usuario que reformule su consulta.

```
              ┌──────────────────────────────────┐
              │              START               │
              └──────────────┬───────────────────┘
                             ↓
                     ┌───────────────┐
                     │   retrieval   │  search() → buildContext()
                     └───────┬───────┘
                             ↓
                  ┌─────────────────────┐
                  │  ¿contexto válido?  │  conditional edge
                  └────┬───────────┬────┘
                       │           │
                  SÍ   │           │  NO
                       ↓           ↓
               ┌──────────┐   ┌────────────┐
               │generate   │   │reformulate │  muestra topics
               └─────┬─────┘   │ y pide     │  y espera input
                     ↓         │ nueva query│
                    END        └─────┬──────┘
                                     ↓
                              ┌───────────┐
                              │ retrieval │  reintenta
                              └───────────┘
```

### Conceptos LangGraph

| Concepto        | Qué es                                               |
| --------------- | ---------------------------------------------------- |
| **StateSchema** | Contrato de datos del grafo (query, context, answer) |
| **StateGraph**  | Contenedor de nodos y edges                          |
| **Node**        | Función que recibe state y retorna un partial update |
| **Edge**        | Conexión directa entre nodos                         |
| **START / END** | Marcadores de entrada y salida del grafo             |

## Stack

- **TypeScript** + **Node.js** (ESM)
- **LangGraph** (`@langchain/langgraph`) para orquestación del grafo
- **OpenAI API** (embeddings + chat completions)
- **Zod** para validación de schemas
- **Vitest** para tests unitarios

## Estructura del proyecto

```
src/
├── index.ts                  → CLI interactivo
├── graph/
│   ├── state.ts              → StateSchema del grafo
│   ├── graph.ts              → Grafo V1 (lineal)
│   └── graphV2.ts            → Grafo V2 (conditional edges, loops)
├── rag/
│   ├── types.ts              → Interfaces (Document, SearchResult...)
│   └── documents.ts          → Carga de archivos .md
├── services/
│   ├── contextBuilder.ts     → Formateo de contexto
│   ├── embeddingService.ts   → Generación de embeddings
│   ├── generationService.ts  → Llamadas al LLM
│   ├── retrievalService.ts   → Búsqueda por similitud coseno
│   ├── ragService.ts         → Orquestación RAG tradicional
│   └── storage.ts            → Persistencia de embeddings
├── utils/
│   └── cosineSimilarity.ts   → Cálculo de similitud coseno
└── knowledge/                → Documentos fuente (.md)
```

## Setup

```bash
npm install
cp .env.example .env   # añade tu OPENAI_API_KEY
npm start
```

## Scripts

| Comando          | Descripción                  |
| ---------------- | ---------------------------- |
| `npm start`      | Ejecuta la app CLI           |
| `npm test`       | Ejecuta los tests con Vitest |
| `npm run build`  | Compila TypeScript           |
| `npm run lint`   | Lint check                   |
| `npm run format` | Formatea con Prettier        |
