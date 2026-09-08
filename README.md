# typescript-rag-langgraph-lab

Proyecto personal de aprendizaje autodidacta para explorar **RAG** y **LangGraph** implementando un pipeline desde cero en TypeScript.

## Qué es esto

Un CLI interactivo que permite:

1. Cargar documentos Markdown de temas variados.
2. Generar embeddings vectoriales con OpenAI (`text-embedding-3-small`).
3. Persistir embeddings en `data/embeddings.json`.
4. Buscar por similitud coseno entre consultas y documentos.
5. Hacer preguntas al LLM usando el contexto recuperado (RAG).
6. Testear la orquestación del RAG con LangGraph.

## Arquitectura RAG

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

## RAG directo vs LangGraph

**RAG tradicional** — encadenado con funciones:

```
Question → search() → generateAnswer() → Answer
```

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

### Conceptos LangGraph

| Concepto | Qué es |
|---|---|
| **StateSchema** | Contrato de datos del grafo (query, context, answer) |
| **StateGraph** | Contenedor de nodos y edges |
| **Node** | Función que recibe state y retorna un partial update |
| **Edge** | Conexión directa entre nodos |
| **START / END** | Marcadores de entrada y salida del grafo |

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
│   └── graph.ts              → Definición del grafo LangGraph
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

| Comando | Descripción |
|---|---|
| `npm start` | Ejecuta la app CLI |
| `npm test` | Ejecuta los tests con Vitest |
| `npm run build` | Compila TypeScript |
| `npm run lint` | Lint check |
| `npm run format` | Formatea con Prettier |
