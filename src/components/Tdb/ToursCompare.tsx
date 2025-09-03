// components/Tdb/ToursCompare.tsx
import { useEffect, useMemo, useState } from 'react';
import { fetchCoutsParTournee } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ToursCompare({ dateDebut, dateFin, top = 10 }: { dateDebut: string; dateFin: string; top?: number; }) {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    if (!dateDebut || !dateFin) return;
    fetchCoutsParTournee(dateDebut, dateFin)
      .then(setRows)
      .catch(e => setErr(e?.message || 'Erreur inconnue'));
  }, [dateDebut, dateFin]);

  const data = useMemo(() => rows.slice(0, top), [rows, top]);

  if (err) return <div className="bg-white p-4 rounded-xl shadow-soft text-red-600">Erreur: {err}</div>;

  return (
    <div className="bg-white p-4 rounded-xl shadow-soft">
      <div className="text-sm text-gray-500">Top tournées (coût moyen par exécution)</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tournee_nom" hide={false} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cout_moyen_par_execution" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
