"use client";

import { useMemo, useState, useId } from "react";
import { cn } from "@/lib/utils";

export interface TrendSeries {
  name: string;
  /** Tailwind-independent stroke colour, e.g. "#22c55e" */
  color: string;
  points: { label: string; value: number }[];
}

interface TrendChartProps {
  series: TrendSeries[];
  /** Formats the tooltip / axis value. Defaults to raw number. */
  formatValue?: (v: number) => string;
  /** Force the Y axis ceiling (e.g. 100 for percentages). */
  maxValue?: number;
  height?: number;
  className?: string;
}

const W = 640;
const PAD = { top: 12, right: 12, bottom: 26, left: 40 };

/**
 * Dependency-free line chart. Pure SVG + viewBox, so it scales to any
 * container width and stays crisp on mobile without a charting library.
 */
export function TrendChart({
  series,
  formatValue = (v) => String(v),
  maxValue,
  height = 220,
  className,
}: TrendChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const count = labels.length;

  const max = useMemo(() => {
    if (maxValue != null) return maxValue;
    const peak = Math.max(
      1,
      ...series.flatMap((s) => s.points.map((p) => p.value)),
    );
    return Math.ceil(peak * 1.15);
  }, [series, maxValue]);

  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (count <= 1 ? innerW / 2 : (i / (count - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  if (!count) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-white/30">
        No data yet
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={series.map((s) => s.name).join(", ")}
      >
        <defs>
          {series.map((s, si) => (
            <linearGradient
              key={s.name}
              id={`fill-${uid}-${si}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid + Y axis */}
        {gridLines.map((g) => {
          const gy = PAD.top + innerH - g * innerH;
          return (
            <g key={g}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={gy}
                y2={gy}
                stroke="currentColor"
                className="text-white/8"
                strokeDasharray="3 4"
              />
              <text
                x={PAD.left - 8}
                y={gy + 3.5}
                textAnchor="end"
                className="fill-white/35"
                fontSize="9"
              >
                {formatValue(Math.round(max * g))}
              </text>
            </g>
          );
        })}

        {/* Series */}
        {series.map((s, si) => {
          const line = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`)
            .join(" ");
          const area = `${line} L ${x(count - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;
          return (
            <g key={s.name}>
              <path d={area} fill={`url(#fill-${uid}-${si})`} />
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.points.map((p, i) => (
                <circle
                  key={p.label}
                  cx={x(i)}
                  cy={y(p.value)}
                  r={hover === i ? 4 : 2.5}
                  fill={s.color}
                  className="transition-all duration-150"
                />
              ))}
            </g>
          );
        })}

        {/* X labels — thinned on narrow ranges */}
        {labels.map((label, i) => {
          const step = count > 8 ? Math.ceil(count / 6) : 1;
          if (i % step !== 0 && i !== count - 1) return null;
          return (
            <text
              key={label + i}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-white/35"
              fontSize="9"
            >
              {label}
            </text>
          );
        })}

        {/* Hover crosshair */}
        {hover != null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke="currentColor"
            className="text-white/25"
          />
        )}

        {/* Hit zones */}
        {labels.map((label, i) => (
          <rect
            key={`hit-${label}-${i}`}
            x={x(i) - innerW / (count * 2 || 1)}
            y={PAD.top}
            width={innerW / (count || 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {/* Legend + hovered readout */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-xs text-white/50">{s.name}</span>
            {hover != null && (
              <span className="text-xs font-semibold text-white">
                {formatValue(s.points[hover]?.value ?? 0)}
              </span>
            )}
          </div>
        ))}
        {hover != null && (
          <span className="text-xs text-white/30 ml-auto">{labels[hover]}</span>
        )}
      </div>
    </div>
  );
}
