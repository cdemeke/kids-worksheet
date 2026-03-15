'use client';

import React, { useState } from 'react';
import { WorksheetConfig, AgeRange, WorksheetType, ContentMode } from '@/lib/types';

interface WorksheetConfigFormProps {
  onGenerate: (config: WorksheetConfig) => void;
  isLoading: boolean;
}

export default function WorksheetConfigForm({ onGenerate, isLoading }: WorksheetConfigFormProps) {
  const [childName, setChildName] = useState('');
  const [ageRange, setAgeRange] = useState<AgeRange>('3-5');
  const [worksheetType, setWorksheetType] = useState<WorksheetType>('letters');
  const [contentMode, setContentMode] = useState<ContentMode>('auto');
  const [customContent, setCustomContent] = useState('');
  const [theme, setTheme] = useState('');
  const [includeGuideSheet, setIncludeGuideSheet] = useState(true);
  const [copies, setCopies] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: WorksheetConfig = {
      childName,
      ageRange,
      worksheetType,
      contentMode,
      customContent: contentMode === 'custom' ? customContent.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      theme: theme || undefined,
      includeGuideSheet,
      copies,
    };
    onGenerate(config);
  };

  const ageOptions: { value: AgeRange; label: string }[] = [
    { value: '3-5', label: '3–5 years' },
    { value: '5-7', label: '5–7 years' },
    { value: '7-9', label: '7–9 years' },
  ];

  const typeOptions: { value: WorksheetType; label: string; icon: string }[] = [
    { value: 'letters', label: 'Letters', icon: 'Aa' },
    { value: 'numbers', label: 'Numbers', icon: '123' },
    { value: 'words', label: 'Words', icon: 'cat' },
    { value: 'sentences', label: 'Sentences', icon: 'I run.' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Child's Name */}
      <div>
        <label htmlFor="childName" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Child&apos;s Name
        </label>
        <input
          id="childName"
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="e.g. Emma"
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all"
        />
      </div>

      {/* Age Range */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age Range</label>
        <div className="grid grid-cols-3 gap-2">
          {ageOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAgeRange(opt.value)}
              className={`rounded-xl py-3 px-4 text-sm font-medium transition-all border-2 ${
                ageRange === opt.value
                  ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Worksheet Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Worksheet Type</label>
        <div className="grid grid-cols-4 gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setWorksheetType(opt.value)}
              className={`rounded-xl py-3 px-4 text-sm font-medium transition-all border-2 flex flex-col items-center gap-1 ${
                worksheetType === opt.value
                  ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-xs text-slate-400 font-mono">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Mode */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setContentMode('auto')}
            className={`rounded-xl py-3 px-4 text-sm font-medium transition-all border-2 ${
              contentMode === 'auto'
                ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            Auto (AI picks)
          </button>
          <button
            type="button"
            onClick={() => setContentMode('custom')}
            className={`rounded-xl py-3 px-4 text-sm font-medium transition-all border-2 ${
              contentMode === 'custom'
                ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            Custom
          </button>
        </div>
        {contentMode === 'custom' && (
          <textarea
            value={customContent}
            onChange={(e) => setCustomContent(e.target.value)}
            placeholder={
              worksheetType === 'letters'
                ? 'A, B, C, D, E'
                : worksheetType === 'numbers'
                  ? '1, 2, 3, 4, 5'
                  : worksheetType === 'words'
                    ? 'cat, dog, sun, hat'
                    : 'The cat sat. I can run.'
            }
            className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all resize-none h-24"
          />
        )}
      </div>

      {/* Theme */}
      <div>
        <label htmlFor="theme" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Fun Theme <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          id="theme"
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="e.g. dinosaurs, space, my dog Biscuit"
          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all"
        />
      </div>

      {/* Include Guide Sheet */}
      <div className="flex items-center justify-between rounded-xl border-2 border-slate-200 px-4 py-3">
        <div>
          <span className="text-sm font-semibold text-slate-700">Parent Guide Sheet</span>
          <p className="text-xs text-slate-500">Coaching tips and developmental context</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={includeGuideSheet}
          onClick={() => setIncludeGuideSheet(!includeGuideSheet)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
            includeGuideSheet ? 'bg-violet-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
              includeGuideSheet ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Number of Copies */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Copies</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCopies(Math.max(1, copies - 1))}
            disabled={copies <= 1}
            className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg font-bold"
          >
            -
          </button>
          <span className="text-lg font-semibold text-slate-700 w-8 text-center">{copies}</span>
          <button
            type="button"
            onClick={() => setCopies(Math.min(5, copies + 1))}
            disabled={copies >= 5}
            className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-violet-600 py-4 px-6 text-white font-semibold text-base hover:bg-violet-700 focus:ring-4 focus:ring-violet-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-200"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Worksheet'
        )}
      </button>
    </form>
  );
}
