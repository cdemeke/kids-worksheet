'use client';

import React, { forwardRef } from 'react';
import { GeneratedWorksheet } from '@/lib/types';
import { TracingRow, BlankRow } from './TracingText';

interface WorksheetPreviewProps {
  worksheet: GeneratedWorksheet;
}

const WorksheetPreview = forwardRef<HTMLDivElement, WorksheetPreviewProps>(
  function WorksheetPreview({ worksheet }, ref) {
    const { config, content, guideSheet } = worksheet;
    const ageLabel = config.ageRange === '3-5' ? '3–5' : config.ageRange === '5-7' ? '5–7' : '7–9';

    const renderWorksheetPages = () => {
      const pages: React.ReactNode[] = [];

      for (let copy = 0; copy < config.copies; copy++) {
        pages.push(
          <div key={`worksheet-${copy}`} className="worksheet-page bg-white" style={{ width: '8.5in', minHeight: '11in', padding: '0.5in', boxSizing: 'border-box' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-violet-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {config.childName ? `${config.childName}'s` : 'My'} Practice Sheet
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {config.worksheetType === 'letters' ? 'Letter' : config.worksheetType === 'numbers' ? 'Number' : config.worksheetType === 'words' ? 'Word' : 'Sentence'} Practice
                  {config.theme ? ` — ${config.theme}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                  Age {ageLabel}
                </span>
              </div>
            </div>

            {/* Content rows */}
            <div className="space-y-5">
              {content.map((item, idx) => (
                <div key={`${copy}-${idx}`} className="content-block">
                  {/* Model letter/word with label */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {item.type === 'letter' || item.type === 'number' ? 'Trace' : item.type === 'word' ? 'Write' : 'Copy'}:
                    </span>
                    <span className="text-lg font-bold text-slate-700" style={{ fontFamily: "'Arial Rounded MT Bold', Arial, sans-serif" }}>
                      {item.displayValue}
                    </span>
                  </div>

                  {/* Tracing row — fills across the full line */}
                  <TracingRow
                    text={item.displayValue}
                    type={item.type}
                    ageRange={config.ageRange}
                    fillRow
                  />

                  {/* Blank practice rows */}
                  {Array.from({ length: item.tracingRows - 1 }).map((_, ri) => (
                    <div key={ri} className="mt-1">
                      <BlankRow ageRange={config.ageRange} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-2">
                <span>
                  Page {copy + 1} of {config.copies + (guideSheet ? 1 : 0)}
                </span>
                <span>Kids Prints</span>
              </div>
            </div>
          </div>
        );
      }

      return pages;
    };

    const renderGuideSheet = () => {
      if (!guideSheet) return null;

      return (
        <div className="worksheet-page bg-white" style={{ width: '8.5in', minHeight: '11in', padding: '0.5in', boxSizing: 'border-box' }}>
          {/* Header */}
          <div className="mb-6 pb-3 border-b-2 border-amber-200">
            <h1 className="text-2xl font-bold text-slate-800">Parent & Teacher Guide</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Companion sheet for {config.childName ? `${config.childName}'s` : 'your child\'s'} practice worksheet
            </p>
          </div>

          {/* Practice Description */}
          <section className="mb-5">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1.5">
              What We&apos;re Practicing Today
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{guideSheet.practiceDescription}</p>
          </section>

          {/* Developmental Context */}
          <section className="mb-5">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1.5">
              Why This Matters
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{guideSheet.developmentalContext}</p>
          </section>

          {/* How to Use */}
          <section className="mb-5">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1.5">
              How to Use This Sheet
            </h2>
            <ol className="list-decimal list-inside space-y-1.5">
              {guideSheet.howToUse.map((step, i) => (
                <li key={i} className="text-sm text-slate-700 leading-relaxed">{step}</li>
              ))}
            </ol>
          </section>

          {/* Common Mistakes */}
          <section className="mb-5">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1.5">
              Common Mistakes to Watch For
            </h2>
            <ul className="space-y-1.5">
              {guideSheet.commonMistakes.map((mistake, i) => (
                <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                  <span className="text-amber-500 shrink-0">*</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </section>

          {/* Encouragement */}
          <section className="mb-5">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1.5">
              Encouragement Prompts
            </h2>
            <div className="space-y-2">
              {guideSheet.encouragementPrompts.map((prompt, i) => (
                <p key={i} className="text-sm text-slate-700 italic bg-amber-50 rounded-lg px-3 py-2">
                  {prompt}
                </p>
              ))}
            </div>
          </section>

          {/* Extension Activity */}
          <section className="mb-5">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-1.5">
              Extension Activity
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-violet-50 rounded-lg px-4 py-3">
              {guideSheet.extensionActivity}
            </p>
          </section>

          {/* Footer */}
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-2">
              <span>
                Page {config.copies + 1} of {config.copies + 1}
              </span>
              <span>Kids Prints</span>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className="print-area">
        {renderWorksheetPages()}
        {renderGuideSheet()}
      </div>
    );
  }
);

export default WorksheetPreview;
