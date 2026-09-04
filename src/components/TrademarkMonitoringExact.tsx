import React, { useState, useMemo } from 'react';
import { getMonitoringSectionData, DateRangeType } from '../lib/dashboardFilterUtils';
import { EnforcementCase } from '../types';

interface SliceData {
  name: string;
  count: number;
  percentage: string;
  color: string;
  side: 'left' | 'right';
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  isDonut: boolean;
  total: number;
  centerLabel?: string;
  legendItems: { name: string; color: string }[];
  slices: { name: string; count: number; color: string }[];
}

const PreciseChart: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  isDonut,
  total,
  centerLabel = '总数',
  legendItems,
  slices,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG dimensions
  const width = 380;
  const height = 270;
  const cx = width / 2;
  const cy = height / 2 + 10;
  const outerR = 76;
  const innerR = isDonut ? 44 : 0;

  // Calculate slice angles
  let currentAngle = -Math.PI / 2;
  const totalCount = total !== undefined ? total : slices.reduce((sum, s) => sum + s.count, 0);

  const activeSlices = slices.filter(s => s.count > 0);

  const calculatedSlices: SliceData[] = totalCount > 0 ? activeSlices.map((slice) => {
    const angleSpan = (slice.count / totalCount) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    currentAngle = endAngle;

    const percentage = ((slice.count / totalCount) * 100).toFixed(1);
    const cosMid = Math.cos(midAngle);
    const side: 'left' | 'right' = cosMid >= 0 ? 'right' : 'left';

    return {
      name: slice.name,
      count: slice.count,
      percentage,
      color: slice.color,
      side,
      startAngle,
      endAngle,
      midAngle,
    };
  }) : [];

  return (
    <div className="flex flex-col justify-between h-full relative group">
      {/* 1. Header: Title & Legends */}
      <div className="px-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            {title}
            <span className="text-[11px] font-normal text-slate-500">
              ({totalCount} 件)
            </span>
          </h3>
          {subtitle && (
            <span className="text-[10.5px] text-slate-400 font-sans hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-[11px] text-slate-600">
          {legendItems.map((item) => (
            <span key={item.name} className="flex items-center gap-1.5 whitespace-nowrap">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-700">{item.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. SVG Chart Area with Leader Lines and Callout Labels */}
      <div className="w-full flex items-center justify-center my-2">
        {totalCount === 0 ? (
          <div className="w-full h-[250px] flex flex-col items-center justify-center text-slate-400 text-xs">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-2">
              <span className="text-slate-400 font-bold font-mono text-sm">0</span>
            </div>
            <span>暂无符合统计条件的数据</span>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-[380px] h-[250px] select-none overflow-visible"
          >
            {/* Slices */}
            {calculatedSlices.length === 1 ? (
              // Single slice 100% case
              <g>
                <circle
                  cx={cx}
                  cy={cy}
                  r={outerR}
                  fill={calculatedSlices[0].color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                {innerR > 0 && (
                  <circle cx={cx} cy={cy} r={innerR} fill="#ffffff" />
                )}
              </g>
            ) : (
              calculatedSlices.map((slice, idx) => {
                const isHovered = hoveredIdx === idx;
                const rOffset = isHovered ? 4 : 0;
                const curOuterR = outerR + rOffset;

                // Coordinates for outer arc (clamp angle difference slightly below 2*PI to avoid SVG arc bug)
                const clampedEnd = Math.min(slice.endAngle, slice.startAngle + 2 * Math.PI - 0.0001);
                const x1 = cx + curOuterR * Math.cos(slice.startAngle);
                const y1 = cy + curOuterR * Math.sin(slice.startAngle);
                const x2 = cx + curOuterR * Math.cos(clampedEnd);
                const y2 = cy + curOuterR * Math.sin(clampedEnd);

                const largeArc = clampedEnd - slice.startAngle > Math.PI ? 1 : 0;

                let pathD = '';
                if (innerR > 0) {
                  // Donut slice
                  const ix1 = cx + innerR * Math.cos(slice.startAngle);
                  const iy1 = cy + innerR * Math.sin(slice.startAngle);
                  const ix2 = cx + innerR * Math.cos(clampedEnd);
                  const iy2 = cy + innerR * Math.sin(clampedEnd);

                  pathD = `
                    M ${x1} ${y1}
                    A ${curOuterR} ${curOuterR} 0 ${largeArc} 1 ${x2} ${y2}
                    L ${ix2} ${iy2}
                    A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}
                    Z
                  `;
                } else {
                  // Solid Pie slice
                  pathD = `
                    M ${cx} ${cy}
                    L ${x1} ${y1}
                    A ${curOuterR} ${curOuterR} 0 ${largeArc} 1 ${x2} ${y2}
                    Z
                  `;
                }

                return (
                  <path
                    key={slice.name}
                    d={pathD}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      filter: isHovered ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.18))' : 'none',
                      opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.7 : 1,
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })
            )}

            {/* Center Text (for Donut Chart) */}
            {isDonut && (
              <g className="pointer-events-none select-none">
                <circle cx={cx} cy={cy} r={innerR - 1} fill="#ffffff" />
                <text
                  x={cx}
                  y={cy - 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-black font-sans fill-slate-900"
                  style={{ fontSize: '24px', fontWeight: 800 }}
                >
                  {totalCount}
                </text>
                <text
                  x={cx}
                  y={cy + 18}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-slate-500 font-sans"
                  style={{ fontSize: '10.5px', fontWeight: 500 }}
                >
                  {centerLabel}
                </text>
              </g>
            )}

            {/* Leader Lines & Callout Labels */}
            {calculatedSlices.map((slice, idx) => {
              const isHovered = hoveredIdx === idx;
              // Arc point near middle of slice
              const lineStartR = outerR + 2;
              const sx = cx + lineStartR * Math.cos(slice.midAngle);
              const sy = cy + lineStartR * Math.sin(slice.midAngle);

              // Elbow point
              const lineMidR = outerR + 18;
              const mx = cx + lineMidR * Math.cos(slice.midAngle);
              const my = cy + lineMidR * Math.sin(slice.midAngle);

              // End horizontal point
              const isRight = slice.side === 'right';
              const ex = isRight ? mx + 16 : mx - 16;
              const ey = my;

              // Text anchor and position
              const tx = isRight ? ex + 4 : ex - 4;
              const ty = ey;
              const textAnchor = isRight ? 'start' : 'end';

              return (
                <g
                  key={`callout-${slice.name}`}
                  className="transition-opacity duration-200 cursor-pointer"
                  style={{
                    opacity: hoveredIdx !== null && !isHovered ? 0.35 : 1,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Elbow Polyline Leader */}
                  <polyline
                    points={`${sx},${sy} ${mx},${my} ${ex},${ey}`}
                    fill="none"
                    stroke={isHovered ? slice.color : '#94a3b8'}
                    strokeWidth={isHovered ? 1.5 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Callout Text */}
                  <text
                    x={tx}
                    y={ty - 6}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    className="font-medium fill-slate-700"
                    style={{
                      fontSize: '10.5px',
                      fontWeight: isHovered ? 700 : 600,
                    }}
                  >
                    {slice.name.length > 8 ? `${slice.name.substring(0, 8)}...` : slice.name}:
                  </text>
                  <text
                    x={tx}
                    y={ty + 7}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    className="font-normal fill-slate-500"
                    style={{
                      fontSize: '10px',
                      fontWeight: isHovered ? 600 : 400,
                    }}
                  >
                    {slice.count}件 ({slice.percentage}%)
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};

export interface TrademarkMonitoringSectionProps {
  enforcementCases?: EnforcementCase[];
  selectedBrand?: string;
  selectedDateRange?: DateRangeType;
  customStartDate?: string;
  customEndDate?: string;
}

export const TrademarkMonitoringSection: React.FC<TrademarkMonitoringSectionProps> = ({
  enforcementCases,
  selectedBrand = 'usmile 笑容加',
  selectedDateRange = '近一年',
  customStartDate,
  customEndDate,
}) => {
  const monitoringData = useMemo(() => {
    return getMonitoringSectionData(
      selectedBrand,
      selectedDateRange,
      customStartDate,
      customEndDate,
      enforcementCases
    );
  }, [selectedBrand, selectedDateRange, customStartDate, customEndDate, enforcementCases]);

  return (
    <div className="bg-white p-4 sm:p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
      {/* Header aligned strictly to design */}
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 pb-3 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
          商标监测
        </h2>
        <span className="text-xs text-slate-500 font-normal">
          {selectedBrand} 维权管理案件按业务类型、案件状态及案件结果统计 ({selectedDateRange} · 维权监测共 {monitoringData.totalCount} 件)
        </span>
      </div>

      {/* 3 Modules Flat Layout separated by vertical divider lines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/90 pt-1">
        {/* Module 1: 案件类型 (按业务类型划分饼圈图) */}
        <div className="py-3 lg:py-0 lg:pr-5 bg-gradient-to-b from-blue-50/20 to-transparent rounded-xl p-2.5">
          <PreciseChart
            title="案件类型"
            subtitle="按业务类型划分"
            isDonut={true}
            total={monitoringData.typeTotal}
            centerLabel="业务总数"
            legendItems={monitoringData.typeLegend}
            slices={monitoringData.typeSlices}
          />
        </div>

        {/* Module 2: 案件状态 (统计待启动、证据准备中、已正式递交、商标局审理中) */}
        <div className="py-4 lg:py-0 lg:px-5 bg-gradient-to-b from-teal-50/20 to-transparent rounded-xl p-2.5">
          <PreciseChart
            title="案件状态"
            subtitle="待启动/证据准备/已递交/审理中"
            isDonut={true}
            total={monitoringData.statusTotal}
            centerLabel="在办总数"
            legendItems={monitoringData.statusLegend}
            slices={monitoringData.statusSlices}
          />
        </div>

        {/* Module 3: 案件结果 (统计维权成功/裁定无效、维权不成立/被驳回、和解结案) */}
        <div className="py-4 lg:py-0 lg:pl-5 bg-gradient-to-b from-indigo-50/20 to-transparent rounded-xl p-2.5">
          <PreciseChart
            title="案件结果"
            subtitle="维权成功/被驳回/和解结案"
            isDonut={true}
            total={monitoringData.resultTotal}
            centerLabel="结案总数"
            legendItems={monitoringData.resultLegend}
            slices={monitoringData.resultSlices}
          />
        </div>
      </div>
    </div>
  );
};
