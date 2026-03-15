import { WorksheetConfig, WorksheetContent, GuideSheet } from './types';

// Dolch sight words by level
const SIGHT_WORDS = {
  preK: ['a', 'and', 'big', 'can', 'for', 'go', 'I', 'in', 'is', 'it', 'my', 'no', 'on', 'run', 'see', 'the', 'to', 'up', 'we', 'you'],
  kindergarten: ['all', 'am', 'are', 'at', 'ate', 'be', 'but', 'came', 'did', 'do', 'eat', 'get', 'good', 'has', 'he', 'into', 'like', 'new', 'now', 'our', 'out', 'say', 'she', 'so', 'that', 'they', 'was', 'will', 'with', 'yes'],
  grade1: ['after', 'again', 'ask', 'by', 'could', 'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when'],
};

// CVC words for young children
const CVC_WORDS = ['cat', 'dog', 'sun', 'hat', 'map', 'red', 'big', 'hop', 'run', 'sit', 'cup', 'pen', 'box', 'bed', 'pig', 'fox', 'bug', 'hen', 'jam', 'log'];

// Theme-based words
const THEME_WORDS: Record<string, string[]> = {
  dinosaurs: ['rex', 'dino', 'roar', 'big', 'stomp', 'tail', 'bone', 'egg', 'dig', 'teeth'],
  space: ['star', 'moon', 'sun', 'rocket', 'mars', 'orbit', 'sky', 'glow', 'beam', 'zoom'],
  animals: ['cat', 'dog', 'bird', 'fish', 'bear', 'frog', 'duck', 'cow', 'pig', 'hen'],
  ocean: ['fish', 'wave', 'sand', 'surf', 'boat', 'swim', 'crab', 'reef', 'tide', 'seal'],
  food: ['cake', 'pie', 'jam', 'egg', 'milk', 'rice', 'soup', 'corn', 'pea', 'fig'],
};

// HWT letter order (easier letters first)
const HWT_LETTER_ORDER = 'FELPITHDBNMRKASVWCGOQJUYZX';

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getThemeWords(theme?: string): string[] {
  if (!theme) return [];
  const key = theme.toLowerCase();
  for (const [k, words] of Object.entries(THEME_WORDS)) {
    if (key.includes(k) || k.includes(key)) return words;
  }
  // Fallback: return some generic fun words
  return [];
}

export function generateMockContent(config: WorksheetConfig): WorksheetContent[] {
  if (config.contentMode === 'custom' && config.customContent?.length) {
    const typeMap = { letters: 'letter', numbers: 'number', words: 'word', sentences: 'sentence' } as const;
    return config.customContent.map((item) => ({
      type: typeMap[config.worksheetType],
      value: item.trim(),
      displayValue: item.trim(),
      tracingRows: config.ageRange === '3-5' ? 2 : 3,
    }));
  }

  const themeWords = getThemeWords(config.theme);

  switch (config.ageRange) {
    case '3-5':
      return generate3to5(config, themeWords);
    case '5-7':
      return generate5to7(config, themeWords);
    case '7-9':
      return generate7to9(config, themeWords);
    default:
      return generate3to5(config, themeWords);
  }
}

function generate3to5(config: WorksheetConfig, themeWords: string[]): WorksheetContent[] {
  const { worksheetType, childName } = config;

  if (worksheetType === 'letters') {
    // HWT: start with easiest letters
    const letters = HWT_LETTER_ORDER.slice(0, 6).split('');
    return letters.map((l) => ({
      type: 'letter' as const,
      value: l,
      displayValue: l,
      tracingRows: 2,
    }));
  }

  if (worksheetType === 'numbers') {
    // Ages 3-5: numbers 1-5
    return ['1', '2', '3', '4', '5'].map((n) => ({
      type: 'number' as const,
      value: n,
      displayValue: n,
      tracingRows: 2,
    }));
  }

  if (worksheetType === 'words') {
    const words = themeWords.length > 0
      ? pickRandom(themeWords.filter(w => w.length <= 3), 4)
      : pickRandom(CVC_WORDS, 4);
    if (childName) {
      words.unshift(childName.split(' ')[0]);
      words.pop();
    }
    return words.map((w) => ({
      type: 'word' as const,
      value: w,
      displayValue: w,
      tracingRows: 2,
    }));
  }

  // Sentences for 3-5 are very simple
  const sentences = [
    `I am ${childName || 'me'}.`,
    'I can run.',
    'See the cat.',
  ];
  return sentences.map((s) => ({
    type: 'sentence' as const,
    value: s,
    displayValue: s,
    tracingRows: 2,
  }));
}

function generate5to7(config: WorksheetConfig, themeWords: string[]): WorksheetContent[] {
  const { worksheetType, childName } = config;

  if (worksheetType === 'letters') {
    const upper = HWT_LETTER_ORDER.split('');
    const pairs = upper.slice(0, 8).map((l) => ({
      type: 'letter' as const,
      value: `${l} ${l.toLowerCase()}`,
      displayValue: `${l}  ${l.toLowerCase()}`,
      tracingRows: 2,
    }));
    return pairs;
  }

  if (worksheetType === 'numbers') {
    // Ages 5-7: numbers 1-10
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((n) => ({
      type: 'number' as const,
      value: n,
      displayValue: n,
      tracingRows: 2,
    }));
  }

  if (worksheetType === 'words') {
    let words = themeWords.length > 0
      ? pickRandom(themeWords, 5)
      : pickRandom([...SIGHT_WORDS.preK, ...SIGHT_WORDS.kindergarten], 6);
    if (childName) {
      words = [childName.split(' ')[0], ...words.slice(0, 5)];
    }
    return words.map((w) => ({
      type: 'word' as const,
      value: w,
      displayValue: w,
      tracingRows: 3,
    }));
  }

  const sentences = [
    `My name is ${childName || 'Sam'}.`,
    'The dog can run.',
    'I like to go out.',
    'We see the big sun.',
  ];
  return sentences.map((s) => ({
    type: 'sentence' as const,
    value: s,
    displayValue: s,
    tracingRows: 2,
  }));
}

function generate7to9(config: WorksheetConfig, themeWords: string[]): WorksheetContent[] {
  const { worksheetType, childName } = config;

  if (worksheetType === 'letters') {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return alphabet.slice(0, 10).map((l) => ({
      type: 'letter' as const,
      value: `${l} ${l.toLowerCase()}`,
      displayValue: `${l}  ${l.toLowerCase()}`,
      tracingRows: 2,
    }));
  }

  if (worksheetType === 'numbers') {
    // Ages 7-9: numbers 1-20
    return Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => ({
      type: 'number' as const,
      value: n,
      displayValue: n,
      tracingRows: 2,
    }));
  }

  if (worksheetType === 'words') {
    const words = themeWords.length > 0
      ? pickRandom(themeWords, 6)
      : pickRandom(SIGHT_WORDS.grade1, 6);
    return words.map((w) => ({
      type: 'word' as const,
      value: w,
      displayValue: w,
      tracingRows: 3,
    }));
  }

  const sentences = [
    `${childName || 'I'} can read every day.`,
    'Once upon a time there was a frog.',
    'The old man could fly over the hill.',
    'After school we like to walk home.',
    'Thank you for the good cake.',
  ];
  return sentences.map((s) => ({
    type: 'sentence' as const,
    value: s,
    displayValue: s,
    tracingRows: 2,
  }));
}

export function generateMockGuide(config: WorksheetConfig): GuideSheet {
  const ageDescriptions: Record<string, string> = {
    '3-5': 'preschool-age children (3–5 years)',
    '5-7': 'kindergarten to early elementary children (5–7 years)',
    '7-9': 'early elementary children (7–9 years)',
  };

  const typeDescriptions: Record<string, string> = {
    letters: 'letter formation and recognition',
    numbers: 'number formation and recognition',
    words: 'word writing and sight word practice',
    sentences: 'sentence writing and spacing',
  };

  const guides: Record<string, GuideSheet> = {
    '3-5': {
      practiceDescription: `Today we're practicing ${typeDescriptions[config.worksheetType]} with ${config.childName || 'your child'}. At this age, focus on large motor movements and getting comfortable holding a pencil.`,
      developmentalContext: `At ages 3–5, children are developing fine motor control. Letters should be large (filling the full line height) and practice sessions short (5–10 minutes). It's perfectly normal for letters to be wobbly or reversed at this stage.`,
      howToUse: [
        'Sit next to your child and do the first letter together.',
        'Point to the starting dot and say "Start here at the top."',
        'Guide their hand for the first tracing, then let them try independently.',
        'Say the letter name or word out loud as they trace.',
        'Take breaks — 5 minutes of focused practice is great at this age!',
      ],
      commonMistakes: [
        'Starting from the bottom instead of the top — gently redirect to the starting dot.',
        'Gripping the pencil too tightly — try a triangular pencil grip helper.',
        'Letter reversals (b/d, p/q) are completely normal and will self-correct with time.',
        'Mixing uppercase and lowercase — for now, focus on uppercase only.',
      ],
      encouragementPrompts: [
        '"Wow, look at that letter! You started right at the top — great job!"',
        '"That\'s a tricky one, but you kept trying. I\'m proud of you!"',
        '"Your letters are getting stronger every time we practice!"',
      ],
      extensionActivity: 'Try "sky writing" — have your child stand up and trace the letters in the air with their whole arm. Make it big and dramatic! This builds the large motor patterns that lead to better pencil control.',
    },
    '5-7': {
      practiceDescription: `Today we're practicing ${typeDescriptions[config.worksheetType]} with ${config.childName || 'your child'}. ${config.theme ? `We're using a fun "${config.theme}" theme to keep things engaging!` : 'Focus on consistent letter size and spacing.'}`,
      developmentalContext: `At ages 5–7, children are ready to form all uppercase letters consistently and begin learning lowercase. They can handle 10–15 minute practice sessions. Letter sizing and staying on the lines become important skills.`,
      howToUse: [
        'Let your child look at the model letter/word before tracing.',
        'Encourage them to say each letter name or sound as they write.',
        'After tracing, have them try writing on the blank lines independently.',
        'Praise effort and improvement, not perfection.',
        'If they get frustrated, switch to a different letter or take a movement break.',
      ],
      commonMistakes: [
        'Inconsistent letter sizing — remind them to touch the top and bottom lines.',
        'Forgetting spaces between words — use a finger space as a guide.',
        'Rushing through tracing — encourage slow, careful strokes.',
        'Pressing too hard or too lightly — practice on different surfaces to find the right pressure.',
      ],
      encouragementPrompts: [
        '"I love how carefully you traced that word. Your handwriting is really improving!"',
        '"You remembered to leave a finger space between words — nice work!"',
        '"Look how neat that line is! You should feel really proud of your writing."',
      ],
      extensionActivity: 'Play "letter detective" — pick one of the practice letters and go on a hunt around your home to find it in books, on packages, or on signs. Count how many you can find in 5 minutes!',
    },
    '7-9': {
      practiceDescription: `Today we're practicing ${typeDescriptions[config.worksheetType]} with ${config.childName || 'your child'}. ${config.theme ? `The "${config.theme}" theme makes practice more fun!` : 'Focus on fluency and consistent spacing.'}`,
      developmentalContext: `At ages 7–9, children should be comfortable with most letter formations and are working on fluency, speed, and consistency. Practice helps build the automaticity needed for longer writing tasks at school.`,
      howToUse: [
        'Have your child read the model text before writing.',
        'Encourage them to write at a comfortable pace — not too fast, not too slow.',
        'Point out what they\'re doing well before suggesting improvements.',
        'Compare their writing from today with last week to show progress.',
        'Keep sessions to 15–20 minutes maximum.',
      ],
      commonMistakes: [
        'Letters drifting above or below the lines — practice slow, deliberate strokes.',
        'Inconsistent slant — keep paper angled slightly for their dominant hand.',
        'Mixing print and cursive styles — stay consistent within one style.',
        'Poor posture affecting writing quality — feet flat, paper angled, non-writing hand stabilizing.',
      ],
      encouragementPrompts: [
        '"Your writing is so clear — anyone could read that easily!"',
        '"I can see how much your handwriting has improved. Great practice!"',
        '"You wrote that whole sentence without stopping — your writing is getting so fluent!"',
      ],
      extensionActivity: 'Start a mini journal — write one sentence about the best part of your day. Over time, this builds writing stamina and creates a fun keepsake to look back on.',
    },
  };

  return guides[config.ageRange] || guides['5-7'];
}
