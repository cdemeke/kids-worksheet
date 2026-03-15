import { GoogleGenAI } from '@google/genai';
import { WorksheetConfig, WorksheetContent, GuideSheet } from './types';

function getClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

const WORKSHEET_SYSTEM = `You are a childhood literacy expert specializing in handwriting development for ages 3–9. You follow the Handwriting Without Tears (HWT) and manuscript print method. Generate age-appropriate, encouraging content for handwriting worksheets. Always return valid JSON only — no markdown, no preamble, no code fences.`;

const GUIDE_SYSTEM = `You are a warm, knowledgeable early childhood education expert. Generate practical parent/teacher guide content for handwriting worksheets. Always return valid JSON only — no markdown, no preamble, no code fences.`;

const EDIT_SYSTEM = `You are helping a parent adjust a handwriting worksheet for their child. The current worksheet config is provided as JSON. The parent will describe a change in plain language. Return ONLY the updated WorksheetConfig JSON — no markdown, no preamble, no code fences.`;

function parseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateWorksheetContent(config: WorksheetConfig): Promise<WorksheetContent[] | null> {
  const ai = getClient();
  if (!ai) return null;

  const typeMap = { letters: 'letter', numbers: 'number', words: 'word', sentences: 'sentence' };
  const contentType = typeMap[config.worksheetType];

  const prompt = `Generate worksheet content for:
- Child name: ${config.childName || 'none'}
- Age range: ${config.ageRange} years
- Type: ${config.worksheetType}
- Theme: ${config.theme || 'none'}
- Custom content: ${config.customContent?.length ? config.customContent.join(', ') : 'use auto selection'}

Return a JSON array of objects matching this schema:
[{
  "type": "${contentType}",
  "value": "the content string",
  "displayValue": "formatted for display",
  "tracingRows": 2
}]

Rules:
- For ages 3-5 letters: Use HWT order (F, E, L, P, I, T, H, D first), uppercase only, 5-6 items
- For ages 3-5 numbers: Numbers 1-5 only
- For ages 3-5 words: 2-3 letter CVC words, 4-5 items
- For ages 5-7 letters: Uppercase + lowercase pairs like "A  a", 6-8 items
- For ages 5-7 numbers: Numbers 1-10
- For ages 5-7 words: Sight words (Dolch Pre-K/K), 5-6 items
- For ages 5-7 sentences: Short 3-5 word sentences, 3-4 items
- For ages 7-9: Grade 1-2 sight words, longer sentences, numbers 1-20
- If a theme is given, weave it into word/sentence choices naturally
- If child name is given, include it in at least one word or sentence item
- tracingRows should be 2 for ages 3-5, 2-3 for older
- Return ONLY the JSON array`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: prompt,
      config: {
        systemInstruction: WORKSHEET_SYSTEM,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return null;
    return parseJSON<WorksheetContent[]>(text);
  } catch (error) {
    console.error('Gemini worksheet generation error:', error);
    return null;
  }
}

export async function generateGuideContent(config: WorksheetConfig): Promise<GuideSheet | null> {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `Generate a parent/teacher guide for a handwriting worksheet with these settings:
- Child name: ${config.childName || 'your child'}
- Age range: ${config.ageRange} years
- Worksheet type: ${config.worksheetType}
- Theme: ${config.theme || 'none'}

Return a JSON object matching this schema:
{
  "practiceDescription": "1-2 sentence description of what we're practicing today",
  "developmentalContext": "1-2 sentence developmental context for this age",
  "howToUse": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "commonMistakes": ["mistake 1 with tip", "mistake 2 with tip", "mistake 3 with tip"],
  "encouragementPrompts": ["quoted phrase 1", "quoted phrase 2", "quoted phrase 3"],
  "extensionActivity": "One simple offline activity description"
}

Rules:
- Be warm, practical, and encouraging
- Tailor advice to the specific age range and content type
- If a theme is given, reference it in the extension activity
- Keep the total content brief enough to fit on one printed page
- Return ONLY the JSON object`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: prompt,
      config: {
        systemInstruction: GUIDE_SYSTEM,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return null;
    return parseJSON<GuideSheet>(text);
  } catch (error) {
    console.error('Gemini guide generation error:', error);
    return null;
  }
}

export async function editWorksheetConfig(
  currentConfig: WorksheetConfig,
  userMessage: string
): Promise<{ config: WorksheetConfig; response: string } | null> {
  const ai = getClient();
  if (!ai) return null;

  const prompt = `Current worksheet config:
${JSON.stringify(currentConfig, null, 2)}

Parent's request: "${userMessage}"

Return a JSON object with two fields:
{
  "config": { ...the updated WorksheetConfig... },
  "response": "A friendly 1-2 sentence description of what you changed"
}

The config must match the WorksheetConfig schema:
- childName: string
- ageRange: "3-5" | "5-7" | "7-9"
- worksheetType: "letters" | "numbers" | "words" | "sentences"
- contentMode: "auto" | "custom"
- customContent: string[] (optional)
- theme: string (optional)
- includeGuideSheet: boolean
- copies: number (1-5)

Only change what the parent asked for. Return ONLY the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: prompt,
      config: {
        systemInstruction: EDIT_SYSTEM,
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) return null;
    return parseJSON<{ config: WorksheetConfig; response: string }>(text);
  } catch (error) {
    console.error('Gemini edit error:', error);
    return null;
  }
}
