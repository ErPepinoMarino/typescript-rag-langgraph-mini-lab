import { StateSchema, ReducedValue } from '@langchain/langgraph';
import { z } from 'zod';

const GraphState = new StateSchema({
  query: z.string(),
  context: z.string(),
  answer: z.string(),
  iteration: new ReducedValue(z.number().default(0), {
    inputSchema: z.number(),
    reducer: (current, next) => current + next,
  }),
});

export { GraphState };
