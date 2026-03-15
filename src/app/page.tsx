'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { WorksheetConfig, GeneratedWorksheet, ChatMessage } from '@/lib/types';
import WorksheetConfigForm from '@/components/WorksheetConfigForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import ChatPanel from '@/components/ChatPanel';

type AppView = 'generator' | 'preview';

function encodeConfig(config: WorksheetConfig): string {
  return btoa(JSON.stringify(config));
}

function decodeConfig(encoded: string): WorksheetConfig | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export default function Home() {
  const [view, setView] = useState<AppView>('generator');
  const [worksheet, setWorksheet] = useState<GeneratedWorksheet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [history, setHistory] = useState<GeneratedWorksheet[]>([]);
  const [worksheetUrl, setWorksheetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedWorksheets, setSavedWorksheets] = useState<GeneratedWorksheet[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: worksheet
      ? `${worksheet.config.childName || 'Kids'}-practice-sheet`
      : 'practice-sheet',
  });

  const generateFromConfig = useCallback(async (config: WorksheetConfig, updateUrl = true) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data: GeneratedWorksheet = await res.json();
      setWorksheet(data);
      setHistory([]);
      setChatMessages([]);
      setView('preview');

      // Update URL with encoded config
      if (updateUrl) {
        const encoded = encodeConfig(config);
        const url = `${window.location.origin}${window.location.pathname}?ws=${encoded}`;
        window.history.pushState({}, '', `?ws=${encoded}`);
        setWorksheetUrl(url);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate worksheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Load saved worksheets from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kids-prints-saved');
      if (saved) setSavedWorksheets(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // On mount, check URL for worksheet config and auto-generate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wsParam = params.get('ws');
    if (wsParam) {
      const config = decodeConfig(wsParam);
      if (config) {
        const url = `${window.location.origin}${window.location.pathname}?ws=${wsParam}`;
        setWorksheetUrl(url);
        generateFromConfig(config, false);
      }
    }
  }, [generateFromConfig]);

  const handleGenerate = useCallback(async (config: WorksheetConfig) => {
    await generateFromConfig(config, true);
  }, [generateFromConfig]);

  const handleChatMessage = useCallback(async (message: string) => {
    if (!worksheet) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/edit-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentConfig: worksheet.config,
          userMessage: message,
        }),
      });
      if (!res.ok) throw new Error('Failed to edit');
      const data = await res.json();

      // Save current state to history for undo
      setHistory((prev) => [...prev, worksheet]);
      setWorksheet(data.worksheet);

      // Update URL with new config
      const encoded = encodeConfig(data.worksheet.config);
      const url = `${window.location.origin}${window.location.pathname}?ws=${encoded}`;
      window.history.replaceState({}, '', `?ws=${encoded}`);
      setWorksheetUrl(url);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I had trouble applying that change. Could you try rephrasing?',
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  }, [worksheet]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setWorksheet(previous);
    setChatMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Reverted to previous version.', timestamp: new Date().toISOString() },
    ]);
  }, [history]);

  const handleSave = useCallback(() => {
    if (!worksheet) return;
    const updated = [worksheet, ...savedWorksheets].slice(0, 20);
    setSavedWorksheets(updated);
    try {
      localStorage.setItem('kids-prints-saved', JSON.stringify(updated));
    } catch { /* localStorage might be full */ }
  }, [worksheet, savedWorksheets]);

  const handleStartOver = useCallback(() => {
    setView('generator');
    setWorksheet(null);
    setChatMessages([]);
    setHistory([]);
    setChatOpen(false);
    setWorksheetUrl(null);
    setCopied(false);
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handleCopyUrl = useCallback(() => {
    if (!worksheetUrl) return;
    navigator.clipboard.writeText(worksheetUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [worksheetUrl]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - hidden when printing */}
      <header className="bg-white border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Kids Prints</h1>
              <p className="text-xs text-slate-500">Handwriting Worksheet Generator</p>
            </div>
          </div>

          {view === 'preview' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartOver}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleSave}
                className="text-sm font-medium text-violet-600 hover:text-violet-700 px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => handlePrint()}
                className="text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Print
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      {view === 'generator' && (
        <main className="max-w-lg mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create a Worksheet</h2>
            <p className="text-slate-500">
              Set up a handwriting practice sheet tailored to your child
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <WorksheetConfigForm onGenerate={handleGenerate} isLoading={isGenerating} />
          </div>

          {/* Saved Worksheets */}
          {savedWorksheets.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Worksheets</h3>
              <div className="space-y-2">
                {savedWorksheets.slice(0, 5).map((ws, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setWorksheet(ws);
                      setView('preview');
                      const encoded = encodeConfig(ws.config);
                      const url = `${window.location.origin}${window.location.pathname}?ws=${encoded}`;
                      window.history.pushState({}, '', `?ws=${encoded}`);
                      setWorksheetUrl(url);
                    }}
                    className="w-full text-left bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-violet-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-slate-700">
                          {ws.config.childName || 'Unnamed'}&apos;s {ws.config.worksheetType} sheet
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          Age {ws.config.ageRange}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(ws.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {view === 'preview' && worksheet && (
        <div className="flex">
          {/* Preview Area */}
          <main className="flex-1 p-6 overflow-auto" style={{ maxHeight: 'calc(100vh - 73px)' }}>
            {/* Controls bar */}
            <div className="max-w-[8.5in] mx-auto mb-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleStartOver}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Edit Settings
                </button>
              </div>
              <div className="flex items-center gap-2">
                {worksheet.guideSheet && (
                  <span className="text-xs text-slate-400">
                    {worksheet.config.copies} worksheet page{worksheet.config.copies > 1 ? 's' : ''} + 1 guide
                  </span>
                )}
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="text-sm font-medium text-violet-600 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Edit with AI
                </button>
              </div>
            </div>

            {/* Shareable URL bar */}
            {worksheetUrl && (
              <div className="max-w-[8.5in] mx-auto mb-4 no-print">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <input
                    type="text"
                    readOnly
                    value={worksheetUrl}
                    className="flex-1 text-xs text-slate-500 bg-transparent border-none outline-none truncate"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopyUrl}
                    className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors shrink-0 ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}

            {/* Print tip */}
            <div className="max-w-[8.5in] mx-auto mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 no-print">
              Tip: Use your browser&apos;s &quot;Print &rarr; Save as PDF&quot; option to save as a PDF file.
            </div>

            {/* Worksheet Preview */}
            <div className="flex justify-center">
              <WorksheetPreview ref={printRef} worksheet={worksheet} />
            </div>
          </main>

          {/* Chat Panel */}
          <div className="relative no-print">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleChatMessage}
              onUndo={handleUndo}
              canUndo={history.length > 0}
              isLoading={isChatLoading}
              isOpen={chatOpen}
              onToggle={() => setChatOpen(!chatOpen)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
