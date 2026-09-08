import { StateSchema } from '@langchain/langgraph';
import { z } from 'zod';

const GraphState = new StateSchema({
  query: z.string(),
  context: z.string(),
  answer: z.string(),
});

export { GraphState };
