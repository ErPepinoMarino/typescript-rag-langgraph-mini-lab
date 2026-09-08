//Este es el grafo divertido, el que tiene mas chicha.
import readline from 'readline';
import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphState } from './state.js';
import { search } from '../services/retrievalService.js';
import { buildContext } from '../services/contextBuilder.js';
import { generateAnswer } from '../services/generationService.js';
import { loadEmbeddedDocuments } from '../services/storage.js';

//El usuario podra salir al primer retry, pero por si acaso.
const MAX_RETRIES = 2;

// Y le he pedido al agente que lo adorne.
const reset = '\x1b[0m';
const bold = '\x1b[1m';
const cyan = '\x1b[36m';
const yellow = '\x1b[33m';
const green = '\x1b[32m';
const red = '\x1b[31m';

//Espera que el usuario escriba algo y le de al enter.
async function promptUser(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function retrievalNode(state: typeof GraphState.State) {
  const results = await search(state.query);
  const context = buildContext(results);
  return { context };
}

async function generationNode(state: typeof GraphState.State) {
  const answer = await generateAnswer(state.context, state.query);
  return { answer };
}
//Si llega a este nodo la cagamos haciendo la pregunta.
async function reformulateNode(state: typeof GraphState.State) {
  //Importante el añadido, si escribes demasiadas veces mal el prompt te devuelve al menu.
  if (state.iteration >= MAX_RETRIES) {
    const answer =
      'Lo siento, no he podido encontrar documentos relevantes. Prueba con otra consulta.';
    console.log(`\n${red}⚠️  Máximo de reintentos alcanzado.${reset}\n`);
    return { answer };
  }
  //Cargamos los temas y le mostramos al usuario la info que tenemos.
  const docs = await loadEmbeddedDocuments();
  const topics = docs.map((doc) => doc.id);

  console.log(
    `\n${yellow}⚠️  No he encontrado similitud con tu consulta.${reset}`,
  );
  console.log(`\n${bold}Estos son los temas disponibles:${reset}`);
  for (const topic of topics) {
    console.log(`  ${cyan}•${reset} ${topic}`);
  }
  console.log(
    `\n${bold}Escribe una nueva consulta o${reset} ${red}"Salir"${reset} ${bold}para salir.${reset}`,
  );
  //Esperamos al respuesta del usuario
  const newQuery = await promptUser(`\n${cyan}→ ${reset}`);
  //Si escribe salir volvemos al menu.
  if (newQuery.toLowerCase() === 'salir') {
    const answer = '¡Hasta luego! 👋';
    console.log(`\n${green}${answer}${reset}\n`);
    return { answer };
  }
  //Pro tip: iteration 1 = iteration++, el 1 es lo que se suma.
  return { query: newQuery, iteration: 1 };
}
//Decide la si loopeamos
function shouldRetrieve(state: typeof GraphState.State) {
  //si hay respuesta = final feliz
  if (state.answer) {
    return END;
  }
  // Si hemos escrito algo se genera el embedding y compara.
  if (state.context !== '') {
    return 'generation';
  }
  // Si nos hemos pasado de intentos salimos
  if (state.iteration >= MAX_RETRIES) {
    return END;
  }
  // Si venimos de un contexto no vacio, es decir, que hemos escrito algo antes y no tenemos respuesta, algo ha ido mal
  // El sistema nos pide reformular.
  return 'reformulate';
}

const graphV2 = new StateGraph(GraphState)
  .addNode('retrieval', retrievalNode)
  .addNode('generation', generationNode)
  .addNode('reformulate', reformulateNode)
  .addEdge(START, 'retrieval')
  .addConditionalEdges('retrieval', shouldRetrieve)
  .addEdge('reformulate', 'retrieval')
  .addEdge('generation', END)
  .compile();

export { graphV2 };
