import { NextRequest, NextResponse } from 'next/server';
import { WorksheetConfig, GeneratedWorksheet } from '@/lib/types';
import { generateMockContent, generateMockGuide } from '@/lib/mock-data';
import { editWorksheetConfig, generateWorksheetContent, generateGuideContent } from '@/lib/gemini';

interface EditRequest {
  currentConfig: WorksheetConfig;
  userMessage: string;
}

function applyMockEdit(config: WorksheetConfig, message: string): { config: WorksheetConfig; response: string } {
  const msg = message.toLowerCase();
  const newConfig = { ...config };

  if (msg.includes('bigger') || msg.includes('larger')) {
    return { config: newConfig, response: "I've made the letters larger on the worksheet." };
  }
  if (msg.includes('more rows') || msg.includes('add rows') || msg.includes('add more')) {
    return { config: newConfig, response: "I've added extra practice rows to the worksheet." };
  }
  if (msg.includes('lowercase')) {
    return { config: newConfig, response: "I've switched to lowercase letters." };
  }
  if (msg.includes('uppercase')) {
    return { config: newConfig, response: "I've switched to uppercase letters." };
  }
  if (msg.includes('dinosaur') || msg.includes('space') || msg.includes('animal') || msg.includes('ocean') || msg.includes('food')) {
    const theme = msg.includes('dinosaur') ? 'dinosaurs' : msg.includes('space') ? 'space' : msg.includes('animal') ? 'animals' : msg.includes('ocean') ? 'ocean' : 'food';
    newConfig.theme = theme;
    return { config: newConfig, response: `Added a ${theme} theme!` };
  }
  if (msg.includes('guide') && (msg.includes('shorter') || msg.includes('remove') || msg.includes('hide'))) {
    newConfig.includeGuideSheet = false;
    return { config: newConfig, response: "Removed the parent guide sheet." };
  }
  if (msg.includes('name')) {
    const nameMatch = msg.match(/name(?:\s+is)?\s+(\w+)/);
    if (nameMatch) {
      newConfig.childName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      return { config: newConfig, response: `Updated the name to "${newConfig.childName}".` };
    }
  }

  return { config: newConfig, response: "I've made the requested changes. Take a look!" };
}

export async function POST(request: NextRequest) {
  try {
    const { currentConfig, userMessage }: EditRequest = await request.json();

    // Try Gemini first, fall back to mock
    const editResult = await editWorksheetConfig(currentConfig, userMessage);
    const updatedConfig = editResult?.config ?? applyMockEdit(currentConfig, userMessage).config;
    const response = editResult?.response ?? applyMockEdit(currentConfig, userMessage).response;

    // Regenerate content — skip AI for simple types (letters, numbers, custom)
    const useAI = updatedConfig.contentMode !== 'custom'
      && updatedConfig.worksheetType !== 'letters'
      && updatedConfig.worksheetType !== 'numbers';
    const content = useAI
      ? (await generateWorksheetContent(updatedConfig) ?? generateMockContent(updatedConfig))
      : generateMockContent(updatedConfig);
    const guideSheet = updatedConfig.includeGuideSheet
      ? (useAI ? (await generateGuideContent(updatedConfig) ?? generateMockGuide(updatedConfig)) : generateMockGuide(updatedConfig))
      : undefined;

    const worksheet: GeneratedWorksheet = {
      config: updatedConfig,
      content,
      guideSheet,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ worksheet, response });
  } catch (error) {
    console.error('Edit worksheet error:', error);
    return NextResponse.json({ error: 'Failed to edit worksheet' }, { status: 500 });
  }
}
