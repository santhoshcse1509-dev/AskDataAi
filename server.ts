
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️  GEMINI_API_KEY is missing in .env.local. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

app.post('/api/generate-sql', async (req, res) => {
    try {
        const { prompt, schemaString, sampleString } = req.body;

        if (!apiKey) {
             res.status(500).json({ error: "Server missing API Key configuration." });
             return;
        }

        const systemInstruction = `
      You are AskData AI, a world-class SQL expert. 
      Convert natural language into valid, read-only SELECT statements for a browser-based AlaSQL engine.

      DATABASE SCHEMA:
      Table Name: uploaded_data
      Columns:
      ${schemaString}

      SAMPLE DATA:
      ${sampleString}

      STRICT RULES:
      1. ONLY generate SELECT statements. No UPDATE, DELETE, or DROP.
      2. Use backticks for columns with spaces: \`Total Revenue\`.
      3. Use standard SQL aggregate functions (SUM, AVG, COUNT, MIN, MAX).
      4. For dates, assume they are strings or standard JS Date formats.
      5. Output MUST be valid JSON.
      6. If you cannot fulfill the request because it is ambiguous or impossible, set isAmbiguous to true.
    `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash", 
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sql: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        isAmbiguous: { type: Type.BOOLEAN },
                        clarificationMessage: { type: Type.STRING }
                    },
                    required: ['sql', 'explanation', 'isAmbiguous']
                }
            }
        });

        const result = JSON.parse(response.text() || '{}');
        res.json(result);

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: error.message || 'AI processing failed' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
