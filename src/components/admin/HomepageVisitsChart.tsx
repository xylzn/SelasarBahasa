'use client';

interface DailyVisit {
  date: string;
  count: number;
}

interface HomepageVisitsChartProps {
  data: DailyVisit[];
}

const BRAND_BLUE = '#0E46A3';
const BRAND_BLUE_LIGHT = 'rgba(14,70,163,0.35)';

export default function HomepageVisitsChart({ data }: HomepageVisitsChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 120;
  const barWidth = 28;
  const gap = 8;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-3 h-3 rounded-full" style={{ background: BRAND_BLUE }} />
        <h2 className="text-lg font-semibold text-gray-900">Kunjungan Homepage (7 Hari)</h2>
      </div>

      {data.every((d) => d.count === 0) ? (
        <div className="flex items-center justify-center h-40 text-sm text-gray-400">
          Belum ada data kunjungan.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${totalWidth + 2} ${chartHeight + 36}`}
            className="w-full"
            style={{ minWidth: `${totalWidth + 2}px` }}
          >
            {data.map((item, i) => {
              const barH = Math.max(Math.round((item.count / maxCount) * chartHeight), item.count > 0 ? 4 : 0);
              const x = i * (barWidth + gap);
              const y = chartHeight - barH;
              const isToday = i === data.length - 1;

              return (
                <g key={item.date}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx={6}
                    ry={6}
                    fill={isToday ? BRAND_BLUE : BRAND_BLUE_LIGHT}
                  />
                  {/* Count label above bar */}
                  {item.count > 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#4b5563"
                      fontWeight={isToday ? '700' : '400'}
                    >
                      {item.count}
                    </text>
                  )}
                  {/* Date label below bar */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill={isToday ? '#374151' : '#9ca3af'}
                    fontWeight={isToday ? '700' : '400'}
                  >
                    {item.date}
                  </text>
                </g>
              );
            })}
            {/* Baseline */}
            <line
              x1={0}
              y1={chartHeight}
              x2={totalWidth}
              y2={chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400 text-right">Bar biru tua = hari ini</p>
    </div>
  );
}
