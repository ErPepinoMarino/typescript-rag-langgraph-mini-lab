import openai from '../lib/openai.js';

//Genera una respuesta usando OpenAI basada en un contexto y una pregunta.
export async function generateAnswer(
  context: string,
  question: string,
): Promise<string> {
  const response = await openai.chat.completions.create({
    //usamos llm 4o, obviamente no el de embeddings
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Responde la pregunta usando solo el siguiente contexto:\n\n${context}`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
  });

  const answer = response.choices[0]?.message?.content;
  if (!answer) {
    throw new Error('OpenAI no generó una respuesta.');
  }

  return answer;
}
