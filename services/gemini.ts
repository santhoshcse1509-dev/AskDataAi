
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, ColumnMetadata } from "../types";

export class GeminiService {
  // Initialize AI client using the Vite environment variable
  private static ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY });

  static async generateSQL(
    prompt: string,
    columns: ColumnMetadata[],
    sampleData: any[]
  ): Promise<AIResponse> {
    const schemaString = columns
      .map(c => `- ${c.name} (${c.type})`)
      .join('\n');
    
    const sampleString = JSON.stringify(sampleData, null, 2);

    const systemInstruction = `
      You are a specialized SQL query assistant for a micro-SaaS called AskData AI.
      Your goal is to convert plain English questions into SAFE, READ-ONLY SELECT SQL queries.
      
      STRICT RULES:
      1. ONLY generate SELECT statements.
      2. Table name is EXACTLY "uploaded_data".
      3. Use the provided schema ONLY.
      4. Use standard SQL (AlaSQL compatible). Use backticks for column names with spaces: \`Column Name\`.
      5. If the user asks for something that requires modification (UPDATE, DELETE, DROP), refuse politely.
      6. If the question is ambiguous, set isAmbiguous to true and provide a clarificationMessage.
      7. Provide a concise explanation of what the query does in simple English.
      8. Output must be a valid JSON object matching the requested schema.
      
      Schema:
      ${schemaString}
      
      Sample Data:
      ${sampleString}
    `;

    try {
      // Use gemini-1.5-flash for fast and reliable content generation
      const response = await (this.ai as any).models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sql: { type: Type.STRING, description: 'The generated SELECT SQL statement' },
              explanation: { type: Type.STRING, description: 'Brief explanation of the query' },
              isAmbiguous: { type: Type.BOOLEAN, description: 'True if user intent is unclear' },
              clarificationMessage: { type: Type.STRING, description: 'Message asking user for more details if ambiguous' }
            },
            required: ['sql', 'explanation', 'isAmbiguous']
          }
        }
      });

      // Extract generated text from the response object property
      const result = JSON.parse(response.text || '{}');
      return result as AIResponse;
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('Failed to generate SQL. Please try phrasing your question differently.');
    }
  }
}