import {
  ResponsiveContainer,
  ComposedChart,
  XAxis, YAxis, Tooltip, Legend,
  Bar, Line, CartesianGrid
} from 'recharts';

const data = [
  { day: 'Lun', ponctualite: 92, remplissage: 89 },
  { day: 'Mar', ponctualite: 88, remplissage: 91 },
  { day: 'Mer', ponctualite: 94, remplissage: 90 },
  { day: 'Jeu', ponctualite: 90, remplissage: 88 },
  { day: 'Ven', ponctualite: 93, remplissage: 92 },
  { day: 'Sam', ponctualite: 95, remplissage: 87 },
  { day: 'Dim', ponctualite: 91, remplissage: 85 },
];

export function PerformanceChart() {
  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100 h-[360px]">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Performance vs Objectifs
        </h3>
        <p className="text-xs text-gray-500">
          Ponctualité (%) et taux de remplissage (%) sur 7 jours
        </p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Legend />
          <Bar yAxisId="left" dataKey="ponctualite" name="Ponctualité" radius={[6, 6, 0, 0]} />
          <Line yAxisId="right" dataKey="remplissage" name="Remplissage" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
