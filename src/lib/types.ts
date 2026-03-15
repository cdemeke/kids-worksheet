export type AgeRange = '3-5' | '5-7' | '7-9';
export type WorksheetType = 'letters' | 'numbers' | 'words' | 'sentences';
export type ContentMode = 'auto' | 'custom';

export interface WorksheetConfig {
  childName: string;
  ageRange: AgeRange;
  worksheetType: WorksheetType;
  contentMode: ContentMode;
  customContent?: string[];
  theme?: string;
  includeGuideSheet: boolean;
  copies: number;
}

export interface WorksheetContent {
  type: 'letter' | 'number' | 'word' | 'sentence';
  value: string;
  displayValue: string;
  tracingRows: number;
}

export interface GuideSheet {
  practiceDescription: string;
  developmentalContext: string;
  howToUse: string[];
  commonMistakes: string[];
  encouragementPrompts: string[];
  extensionActivity: string;
}

export interface GeneratedWorksheet {
  config: WorksheetConfig;
  content: WorksheetContent[];
  guideSheet?: GuideSheet;
  generatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
