'use client';
import { useMemo } from 'react';

type SeriesPoint = { date: string; value: number };
type Trendline = { label: string; points: SeriesPoint[]; window: 30|90 };

export default function TrendlineChart({ series }: { series: Trendline[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {series.map(s => <MiniChart key={s.label} title={s.label} points={s.points} />)}
    </div>
  );
}

function MiniChart({ title, points }: { title: string; points: SeriesPoint[] }) {
  const max = useMemo(()=> Math.max(1, ...points.map(p=>p.value)), [points]);
  const w = 240, h = 64, pad=4;
  const path = useMemo(()=>{
    return points.map((p, i) => {
      const x = pad + (i*(w-2*pad))/(Math.max(1, points.length-1));
      const y = h - pad - (p.value/max)*(h-2*pad);
      return `${i===0?'M':'L'}${x},${y}`;
    }).join(' ');
  }, [points, max]);
  const last = points[points.length-1]?.value ?? 0;

  return (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-gray-500">Last: {last}</div>
      </div>
      <svg width={w} height={h} role="img" aria-label={`${title} trend`}>
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />
      </svg>
    </div>
  );
}
