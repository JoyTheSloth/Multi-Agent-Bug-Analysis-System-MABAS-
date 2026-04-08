import Groq from 'groq-sdk';

// Initialize the Groq client with the API key from environment variables
// Note: In Vite, env variables prefixed with VITE_ are exposed to the client-side.
// We are using dangerouslyAllowBrowser since this is a frontend-only app for now, but
// in a production environment, you should proxy these calls through a backend.
export const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

export const GROQ_MODEL = "llama-3.1-8b-instant";

/**
 * Basic helper to call Groq for generating analysis data.
 */
export async function generateAnalysisFeedback(prompt: string, fallback: string = ""): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an expert AI system analyst that analyzes error logs and system metrics." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || fallback;
  } catch (error) {
    console.error("Groq API Error:", error);
    return fallback;
  }
}
