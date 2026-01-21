
import { AIResponse, ColumnMetadata } from "../types";



export class GeminiService {
  static async generateSQL(
    prompt: string,
    columns: ColumnMetadata[],
    sampleData: any[]
  ): Promise<AIResponse> {
    const schemaString = columns
      .map(c => `- ${c.name} (Type: ${c.type})`)
      .join('\n');
    
    const sampleString = JSON.stringify(sampleData, null, 2);

    try {
      const response = await fetch('http://localhost:3001/api/generate-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          schemaString,
          sampleString
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini Service Error:', error);
      throw new Error('AI was unable to process this request. Ensure the backend server is running.');
    }
  }
}
