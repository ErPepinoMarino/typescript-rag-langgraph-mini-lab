import OpenAI from 'openai';

//Creo el cliente de OpenAI con la clave
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
