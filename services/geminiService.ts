
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const getGeminiResponse = async (
  prompt: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  options: {
    useSearch?: boolean;
    useThinking?: boolean;
    persona?: string;
  } = {}
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let model = 'gemini-3-flash-preview';
  const config: any = {
    temperature: 0.7,
    topP: 0.9,
  };

  // Adjust model and config based on options
  if (options.useThinking) {
    model = 'gemini-3-pro-preview';
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else if (options.useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  // Define Persona System Instructions
  const personas: Record<string, string> = {
    'Standard': "You are FocusBuddy, a world-class AI study companion. Be helpful, clear, and encouraging.",
    'Socratic': "You are a Socratic tutor. Never give direct answers immediately. Instead, ask leading questions to help the student find the answer themselves.",
    'Strict Coach': "You are a strict academic coach. Be direct, firm about deadlines, and focus purely on efficiency and results. No fluff.",
    'Supportive': "You are an incredibly empathetic and supportive study buddy. Focus on the student's well-being and emotional state as much as their grades."
  };

  const baseInstruction = personas[options.persona || 'Standard'];
  config.systemInstruction = `${baseInstruction} Use emojis to be engaging. If search is enabled, synthesize web info accurately.`;

  const response = await ai.models.generateContent({
    model,
    contents: history.length > 0 ? history : [{ role: 'user', parts: [{ text: prompt }] }],
    config,
  });

  // Extract grounding URLs if present
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title
    })) || [];

  return {
    text: response.text || '',
    sources
  };
};

export const generateFlashcards = async (input: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model,
    contents: `Based on the following study material, generate a set of effective flashcards (question and answer pairs) for active recall: \n\n${input}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const summarizeMaterial = async (input: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model,
    contents: `Summarize the following study material into a concise title, a brief overview, and key bullet points: \n\n${input}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          keyPoints: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "content", "keyPoints"]
      }
    }
  });

  return JSON.parse(response.text);
};
