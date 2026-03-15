# Kids Prints

AI-powered handwriting worksheet generator for children ages 3–9. Generate printable practice sheets tailored to your child's age, skill level, and interests — then refine them with natural-language AI editing.

Built with Next.js 16, React 19, Tailwind CSS, and Google Gemini 2.5 Flash.

## Features

- **Age-appropriate content** — Follows the Handwriting Without Tears (HWT) methodology with Dolch sight words, CVC words, and developmentally sequenced letter order
- **Four worksheet types** — Letters, numbers, words, and sentences with traced examples and blank practice rows
- **Themed worksheets** — Add a fun theme like "dinosaurs" or "space" to personalize word and sentence content
- **Print-ready layout** — 8.5" x 11" pages with ruled lines (top line, dashed midline, baseline) sized per age group
- **Parent & teacher guide** — Optional companion page with developmental context, coaching tips, common mistakes, and encouragement prompts
- **AI chat editing** — Modify a generated worksheet in plain language ("make the letters bigger", "switch to lowercase") with full undo support
- **Smart API usage** — Letters, numbers, and custom content are generated locally (no API call); Gemini is only used for words and sentences where AI adds value
- **Shareable links** — Worksheet configs are encoded in the URL so you can share a worksheet with anyone via link
- **Offline fallback** — Works without an API key using built-in mock data with real educational content
- **Save & recall** — Recently generated worksheets are saved to localStorage for quick access

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone https://github.com/cdemeke/kids-worksheet.git
cd kids-worksheet
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

> **Note:** The app works without an API key — it falls back to curated mock data with real HWT letter sequences, Dolch sight words, and age-appropriate sentences.

### Run (Development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy on Local Network

Build and serve the production app so any device on your Wi-Fi can access it:

```bash
npm run build
npm install -g pm2
pm2 start npm --name "kids-prints" -- start
pm2 save
```

The app will be available at `http://<your-local-ip>:3000` from any device on your network (phones, tablets, other computers).

To auto-start on reboot:

```bash
pm2 startup          # follow the printed instructions (requires sudo)
pm2 save             # save the current process list
```

Useful pm2 commands:

| Command | What it does |
|---------|-------------|
| `pm2 status` | Check if the server is running |
| `pm2 logs kids-prints` | View app logs |
| `pm2 restart kids-prints` | Restart after code changes |
| `pm2 stop kids-prints` | Stop the server |

## Usage

1. **Configure** — Enter your child's name, select their age range, pick a worksheet type, and optionally add a theme
2. **Generate** — Click "Generate Worksheet" to create a print-ready practice sheet
3. **Edit** — Open the "Edit with AI" chat panel to refine the worksheet with natural language
4. **Print** — Hit "Print" or use your browser's Print > Save as PDF to export

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-worksheet/route.ts   # Worksheet generation endpoint
│   │   └── edit-worksheet/route.ts       # AI chat editing endpoint
│   ├── globals.css                       # Global styles and print layout
│   ├── layout.tsx                        # Root layout with metadata
│   └── page.tsx                          # Main app (config form ↔ preview)
├── components/
│   ├── ChatPanel.tsx                     # AI editing chat sidebar
│   ├── TracingText.tsx                   # Tracing text, ruled lines, and row components
│   ├── WorksheetConfigForm.tsx           # Configuration form
│   └── WorksheetPreview.tsx              # Print-ready worksheet renderer
└── lib/
    ├── gemini.ts                         # Google Gemini API integration
    ├── mock-data.ts                      # Fallback content (HWT, Dolch, CVC)
    └── types.ts                          # TypeScript interfaces
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| AI | Google Gemini 2.5 Flash |
| Printing | react-to-print |
| Language | TypeScript 5 |

## License

MIT
