'use client';

import React from 'react';

interface TracingTextProps {
  text: string;
  fontSize?: number;
  className?: string;
}

export default function TracingText({ text, fontSize = 48, className = '' }: TracingTextProps) {
  return (
    <span
      className={`tracing-text ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: "'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif",
        color: 'transparent',
        WebkitTextStroke: '1.5px #94a3b8',
        letterSpacing: '0.15em',
        fontWeight: 700,
        paintOrder: 'stroke fill',
        textRendering: 'geometricPrecision',
      }}
    >
      {text}
    </span>
  );
}

interface RuledLinesProps {
  width?: string;
  height?: number;
  showMidline?: boolean;
  className?: string;
}

export function RuledLines({ width = '100%', height = 48, showMidline = true, className = '' }: RuledLinesProps) {
  return (
    <div className={`ruled-lines relative ${className}`} style={{ width, height: `${height}px` }}>
      {/* Top line */}
      <div className="absolute top-0 left-0 right-0 border-t-2 border-slate-300" />
      {/* Midline (dashed) */}
      {showMidline && (
        <div className="absolute left-0 right-0 border-t border-dashed border-slate-300" style={{ top: '50%' }} />
      )}
      {/* Baseline */}
      <div className="absolute bottom-0 left-0 right-0 border-t-2 border-slate-400" />
    </div>
  );
}

interface TracingRowProps {
  text: string;
  type: 'letter' | 'number' | 'word' | 'sentence';
  ageRange: string;
  fillRow?: boolean;
}

function getRepeatCount(text: string, fontSize: number, rowWidthPx: number): number {
  // Approximate character width as 0.65 * fontSize (accounts for letter spacing)
  const charWidth = fontSize * 0.75;
  const textWidth = text.length * charWidth;
  const spacerWidth = charWidth * 1.5; // gap between repeats
  const totalPerRepeat = textWidth + spacerWidth;
  return Math.max(1, Math.floor(rowWidthPx / totalPerRepeat));
}

export function TracingRow({ text, type, ageRange, fillRow = false }: TracingRowProps) {
  const isYoung = ageRange === '3-5';
  const lineHeight = isYoung ? 64 : type === 'sentence' ? 40 : 48;
  const fontSize = isYoung
    ? (type === 'letter' || type === 'number' ? 56 : 40)
    : type === 'letter' || type === 'number'
      ? 48
      : type === 'word'
        ? 36
        : 28;

  // For fill-row mode, repeat the text across the line
  // Use ~670px as approximate printable row width (7.5in - padding)
  const repeatCount = fillRow ? getRepeatCount(text, fontSize, 670) : 1;
  const repeatedText = fillRow
    ? Array(repeatCount).fill(text).join('   ')
    : text;

  return (
    <div className="tracing-row relative overflow-hidden" style={{ height: `${lineHeight}px` }}>
      {/* Ruled lines behind the text */}
      <RuledLines height={lineHeight} />
      {/* Tracing text overlay */}
      <div className="absolute inset-0 flex items-center pl-4">
        <TracingText text={repeatedText} fontSize={fontSize} />
      </div>
    </div>
  );
}

export function BlankRow({ ageRange }: { ageRange: string }) {
  const isYoung = ageRange === '3-5';
  const lineHeight = isYoung ? 64 : 48;

  return (
    <div className="blank-row" style={{ height: `${lineHeight}px` }}>
      <RuledLines height={lineHeight} />
    </div>
  );
}
