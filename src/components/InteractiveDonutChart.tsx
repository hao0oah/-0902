import React, { useState } from 'react';

export interface DonutSegment {
  id: string;
  name: string;
  count: number;
  color: string;
  description?: string;
}

interface InteractiveDonutChartProps {
  title: string;
  segments: DonutSegment[];
  totalLabel?: string;
}

export const InteractiveDonutChart: React.FC<InteractiveDonutChartProps> = ({
  title,
  segments,
  totalLabel = '总数',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const totalCount = segments.reduce((sum, s) => sum + s.count, 0);
  const circumference = 2 * Math.PI * 54; // r = 54 => ~339.292

  let currentOffset = 0;
  const computed = segments.map((seg) => {
    const ratio = totalCount > 0 ? seg.count / totalCount : 0;
    const dashLength = ratio * circumference;
    const strokeDasharray = `${dashLength.toFixed(2)} ${(circumference - dashLength).toFixed(2)}`;
    const strokeDashoffset = (-currentOffset).toFixed(2);
    const percentage = totalCount > 0 ? (ratio * 100).toFixed(2) : '0.00';
    currentOffset += dashLength;

    return {
      ...seg,
      percentage,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSegment = hoveredIndex !== null ? computed[hoveredIndex] : null;

  return (
    <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between relative">
      {/* 1. Top Row: Title + Legend (与原版完全一致的位置) */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800">{title}</span>
        <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
          {computed.map((seg, idx) => (
            <span
              key={seg.id}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                hoveredIndex === idx ? 'text-slate-900 font-bold' : 'text-slate-600'
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="w-2 h-2 rounded-full transition-transform"
                style={{
                  backgroundColor: seg.color,
                  transform: hoveredIndex === idx ? 'scale(1.25)' : 'scale(1)'
                }}
              />
              {seg.name}
            </span>
          ))}
        </div>
      </div>

      {/* 2. SVG Donut Chart (原版居中位置不变) */}
      <div className="relative py-3 flex items-center justify-center">
        <svg
          viewBox="0 0 160 160"
          className="w-36 h-36 cursor-pointer overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
          onMouseLeave={() => {
            setHoveredIndex(null);
            setMousePos(null);
          }}
        >
          {/* Base circle */}
          <circle
            cx="80"
            cy="80"
            r="54"
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="20"
          />

          {/* Slices with hover response */}
          {computed.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <circle
                key={seg.id}
                cx="80"
                cy="80"
                r="54"
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? 23 : 20}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                transform="rotate(-90 80 80)"
                className="transition-all duration-150 ease-out"
                style={{
                  filter: isHovered ? 'drop-shadow(0 0 4px rgba(0,0,0,0.15))' : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}
        </svg>

        {/* Center Text (固定居中，悬停时显示当前项数据，离开时显示总数) */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          {activeSegment ? (
            <>
              <span
                className="text-lg font-black tracking-tight"
                style={{ color: activeSegment.color }}
              >
                {activeSegment.count}
              </span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">
                {activeSegment.percentage}%
              </span>
            </>
          ) : (
            <>
              <span className="text-xl font-black text-slate-900">{totalCount}</span>
              <span className="text-[10px] text-slate-400">{totalLabel}</span>
            </>
          )}
        </div>

        {/* Floating Tooltip Follows Cursor (浮窗显示具体数据) */}
        {activeSegment && mousePos && (
          <div
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full pb-2"
            style={{
              left: `${Math.min(Math.max(mousePos.x, 25), 135)}px`,
              top: `${Math.max(mousePos.y, 10)}px`,
            }}
          >
            <div className="bg-slate-900/95 text-white px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700 text-xs whitespace-nowrap">
              <div className="flex items-center gap-1.5 font-bold">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: activeSegment.color }}
                />
                <span>{activeSegment.name}:</span>
                <span className="font-mono text-emerald-400">
                  {activeSegment.count} 件 ({activeSegment.percentage}%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Labels (原版底部位置完全不变) */}
      <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-200/60 font-medium">
        {computed.map((seg, idx) => (
          <span
            key={seg.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`cursor-pointer transition-colors ${
              hoveredIndex === idx ? 'text-slate-950 font-bold' : 'text-slate-600'
            }`}
          >
            {seg.name}:{' '}
            <strong className="text-slate-900 font-mono">
              {seg.count} ({seg.percentage}%)
            </strong>
          </span>
        ))}
      </div>
    </div>
  );
};
