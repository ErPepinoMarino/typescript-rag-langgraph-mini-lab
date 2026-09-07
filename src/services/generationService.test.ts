import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generateAnswer } from './generationService.js';

// Mock del módulo openai
vi.mock('../lib/openai.js', () => ({
  default: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

import openai from '../lib/openai.js';

describe('generateAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar la respuesta generada por OpenAI', async () => {
    const mockCreate = vi.mocked(openai.chat.completions.create);
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'RAG es una técnica de IA.' } }],
    } as never);

    const result = await generateAnswer('Contexto sobre RAG', '¿Qué es RAG?');

    expect(result).toBe('RAG es una técnica de IA.');
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it('debe enviar el contexto en el mensaje system', async () => {
    const mockCreate = vi.mocked(openai.chat.completions.create);
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Respuesta' } }],
    } as never);

    const context = 'TypeScript es un superset de JavaScript.';
    await generateAnswer(context, '¿Qué es TypeScript?');

    const callArgs = mockCreate.mock.calls[0];
    if (callArgs) {
      const messages = callArgs[0].messages;
      expect(messages).toHaveLength(2);
      expect(messages?.[0]?.role).toBe('system');
      expect(messages?.[0]?.content).toContain(context);
    }
  });

  it('debe enviar la pregunta en el mensaje user', async () => {
    const mockCreate = vi.mocked(openai.chat.completions.create);
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Respuesta' } }],
    } as never);

    const question = '¿Qué es RAG?';
    await generateAnswer('Contexto', question);

    const callArgs = mockCreate.mock.calls[0];
    if (callArgs) {
      const messages = callArgs[0].messages;
      expect(messages?.[1]?.role).toBe('user');
      expect(messages?.[1]?.content).toBe(question);
    }
  });

  it('debe lanzar error si OpenAI no genera respuesta', async () => {
    const mockCreate = vi.mocked(openai.chat.completions.create);
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '' } }],
    } as never);

    await expect(generateAnswer('Contexto', 'Pregunta')).rejects.toThrow(
      'OpenAI no generó una respuesta.'
    );
  });

  it('debe lanzar error si choices está vacío', async () => {
    const mockCreate = vi.mocked(openai.chat.completions.create);
    mockCreate.mockResolvedValue({
      choices: [],
    } as never);

    await expect(generateAnswer('Contexto', 'Pregunta')).rejects.toThrow(
      'OpenAI no generó una respuesta.'
    );
  });
});
