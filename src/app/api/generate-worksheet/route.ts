import { NextRequest, NextResponse } from 'next/server';
import { WorksheetConfig } from '@/lib/types';
import { generateMockContent, generateMockGuide } from '@/lib/mock-data';
import { generateWorksheetContent, generateGuideContent } from '@/lib/gemini';

// Determine whether this config needs AI generation or can use mock data.
// Letters, numbers, and custom content are deterministic — no API call needed.
// Words and sentences benefit from AI when a theme or name personalization is involved.
function needsAI(config: WorksheetConfig): boolean {
  if (config.contentMode === 'custom') return false;
  if (config.worksheetType === 'letters' || config.worksheetType === 'numbers') return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const config: WorksheetConfig = await request.json();

    const useAI = needsAI(config);
    const content = useAI
      ? (await generateWorksheetContent(config) ?? generateMockContent(config))
      : generateMockContent(config);
    const guideSheet = config.includeGuideSheet
      ? (useAI ? (await generateGuideContent(config) ?? generateMockGuide(config)) : generateMockGuide(config))
      : undefined;

    return NextResponse.json({
      config,
      content,
      guideSheet,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Generate worksheet error:', error);
    return NextResponse.json({ error: 'Failed to generate worksheet' }, { status: 500 });
  }
}
