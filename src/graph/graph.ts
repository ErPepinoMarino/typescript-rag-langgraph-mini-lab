import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphState } from './state.js';
import { search } from '../services/retrievalService.js';
import { buildContext } from '../services/contextBuilder.js';
import { generateAnswer } from '../services/generationService.js';

async function retrievalNode(state: typeof GraphState.State) {
  const results = await search(state.query);
  const context = buildContext(results);
  return { context };
}

async function generationNode(state: typeof GraphState.State) {
  const answer = await generateAnswer(state.context, state.query);
  return { answer };
}

const graph = new StateGraph(GraphState)
  .addNode('retrieval', retrievalNode)
  .addNode('generation', generationNode)
  .addEdge(START, 'retrieval')
  .addEdge('retrieval', 'generation')
  .addEdge('generation', END)
  .compile();

export { graph };
