import { GoogleGenAI, Type } from '@google/genai';

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Please add it to your .env file.'
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export const solveAcademicQuestion = async (question, platform) => {
  if (!question) {
    throw new Error('Question text is required');
  }

  const genai = getClient();

  const prompt = `Solve the following academic question coming from ${platform}. Provide a terse final answer and a detailed step-by-step solution.`;

  const response = await genai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `${prompt}\nQuestion: ${question}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: {
            type: Type.STRING,
            description: 'Final answer in sentence form.',
          },
          solution: {
            type: Type.STRING,
            description: 'Step-by-step reasoning and explanation.',
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Relevant academic tags like math, physics, etc.',
          },
        },
        required: ['answer', 'solution', 'tags'],
      },
    },
  });

  const payload = response.text.trim();
  try {
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to parse Gemini output:', error);
    return {
      answer: payload || 'Unable to parse response.',
      solution: 'The model returned an unexpected format. Raw output above.',
      tags: ['error'],
    };
  }
};
