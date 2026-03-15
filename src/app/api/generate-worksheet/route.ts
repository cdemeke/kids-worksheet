import { NextRequest, NextResponse } from 'next/server';
import { WorksheetConfig } from '@/lib/types';
import { generateMockContent, generateMockGuide } from '@/lib/mock-data';
import { generateWorksheetContent, generateGuideContent } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const config: WorksheetConfig = await request.json();

    // Try Gemini first, fall back to mock data
    const content = await generateWorksheetContent(config) ?? generateMockContent(config);
    const guideSheet = config.includeGuideSheet
      ? (await generateGuideContent(config) ?? generateMockGuide(config))
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
