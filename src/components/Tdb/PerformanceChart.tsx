// components/Tdb/RemplissagePonctualiteTimeline.tsx
import { useEffect, useMemo, useState } from 'react';
import { fetchRemplissagePonctualiteTimeline, type RemplPonctuPoint } from '../../lib/api';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, CartesianGrid } from 'recharts';

type Bucket = 'day' | 'week' | 'month';

export default function RemplissagePonctualiteTimeline({
  dateDebut,
  dateFin,
  defaultBucket = 'day',
  defaultSeuil = 10,
}: {
  dateDebut: string;
  dateFin: string;
  defaultBucket?: Bucket;
  defaultSeuil?: number;
  
}) {
  const [bucket, setBucket] = useState<Bucket>(defaultBucket);
  const [seuil, setSeuil] = useState<number>(defaultSeuil);
  const [data, setData] = useState<RemplPonctuPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!dateDebut || !dateFin) return;
    let canceled = false;
    setLoading(true);
    setErr(null);

    fetchRemplissagePonctualiteTimeline(dateDebut, dateFin, bucket, seuil)
      .then(rows => !canceled && setData(rows))
      .catch(e => !canceled && setErr(e?.message || 'Erreur inconnue'))
      .finally(() => !canceled && setLoading(false));

    return () => { canceled = true; };
  }, [dateDebut, dateFin, bucket, seuil]);

  const title = useMemo(() => {
    const label = bucket === 'day' ? 'jour' : bucket === 'week' ? 'semaine' : 'mois';
    return `Taux de remplissage & ponctualité (${label})`;
  }, [bucket]);

  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">
            Remplissage = Σ embarqués / Σ prévus • Ponctualité ≤ {seuil} min d’écart
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border overflow-hidden">
            {(['day','week','month'] as Bucket[]).map(b => (
              <button
                key={b}
                onClick={() => setBucket(b)}
                className={`px-3 py-1 text-sm ${bucket===b ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {b==='day' ? 'Jour' : b==='week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Seuil (min)
            <input
              type="number"
              min={0}
              className="w-16 border rounded px-2 py-1 text-sm"
              value={seuil}
              onChange={(e) => setSeuil(Number(e.target.value || 0))}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Chargement…</div>
      ) : err ? (
        <div className="text-red-600">Erreur : {err}</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="bucket_label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Bar dataKey="ponctualite" name="Ponctualité" radius={[6,6,0,0]} />
              <Line dataKey="taux_remplissage" name="Remplissage" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
