import {
  ResponsiveContainer,
  AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

const data = [
  { period: 'S-4', cout: 12800, facture: 15200 },
  { period: 'S-3', cout: 12200, facture: 14800 },
  { period: 'S-2', cout: 13100, facture: 15500 },
  { period: 'S-1', cout: 12750, facture: 16100 },
  { period: 'S',   cout: 11900, facture: 15800 },
];

export function CostsChart() {
  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100 h-[360px]">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Coûts & Montants facturables
        </h3>
        <p className="text-xs text-gray-500">
          Vue hebdomadaire — consolidation des exécutions
        </p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `${v.toLocaleString()} $`} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()} $`} />
          <Legend />
          <Area type="monotone" dataKey="cout" name="Coûts" fillOpacity={0.25} />
          <Area type="monotone" dataKey="facture" name="À facturer" fillOpacity={0.25} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

