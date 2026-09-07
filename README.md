# typescript-rag-langgraph-lab

Hola! Este es un proyecto personal de aprendizaje autodidacta para explorar los conceptos de **RAG (Retrieval-Augmented Generation)** implementando un pipeline desde cero en TypeScript.

## ¿Qué es esto?

Un CLI interactivo que permite:

1. Cargar documentos breves some temas variados: Typescript, RAG, Unity ;p...
2. Generar embeddings vectoriales con OpenAI (`text-embedding-3-small`).
3. Guarda los embeddings en `data/embeddings.json`.
4. Permite buscar una frase (hasta 500 caracteres) por similitud coseno (comparándolos con los embeddings creados).
5. Hacer preguntas al LLM usando el contexto recuperado (RAG). (se busca primero el mejor documento comparando embedings y luego se le pasa como contexto al llm)
   ...En breve LangGraph

## Stack

- **TypeScript** + **Node.js** (ESM)
- **OpenAI API** (embeddings + chat completions)
- **Vitest** para tests unitarios (el 99% los ha hecho el agente <3)

No se usa LangChain ni LangGraph como dependencias. Todo se implementa a mano para entender los fundamentos.

## Setup

```bash
npm install
cp .env.example .env   # añade tu OPENAI_API_KEY (Facil)
npm start
```

## Scripts

| Comando         | Descripción                  |
| --------------- | ---------------------------- |
| `npm start`     | Ejecuta la app CLI           |
| `npm test`      | Ejecuta los tests con Vitest |
| `npm run build` | Compila TypeScript           |
| `npm run lint`  | Lint + formato check         |
