import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'none';
  trendValue?: string;
};

export function KpiCard({ title, value, sub, trend = 'none', trendValue }: KpiCardProps) {
  const trendIcon =
    trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
    trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null;

  const trendColor =
    trend === 'up' ? 'text-green-600' :
    trend === 'down' ? 'text-red-600' : 'text-gray-400';

  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {trendIcon && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            {trendIcon}
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
