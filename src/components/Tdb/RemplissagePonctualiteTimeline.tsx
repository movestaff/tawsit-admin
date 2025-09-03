import { useEffect, useMemo, useState } from 'react';
import { fetchRemplissagePonctualiteTimeline, type RemplPonctuPoint } from '../../lib/api';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, CartesianGrid } from 'recharts';

type Bucket = 'day' | 'week' | 'month';

function iso(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export default function RemplissagePonctualiteTimeline({
  dateDebut,
  dateFin,
  defaultBucket = 'day',
  defaultSeuil = 20, // avance min (minutes)
}: {
  dateDebut?: string;
  dateFin?: string;
  defaultBucket?: Bucket;
  defaultSeuil?: number;
}) {
  const [bucket, setBucket] = useState<Bucket>(defaultBucket);
  const [avance, setAvance] = useState<number>(defaultSeuil);
  const [data, setData] = useState<RemplPonctuPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Période par défaut = 30 derniers jours si props absentes
  const fallbackFin = useMemo(() => iso(new Date()), []);
  const fallbackDebut = useMemo(() => iso(new Date(Date.now() - 29 * 86400000)), []);
  const dDebut = dateDebut || fallbackDebut;
  const dFin = dateFin || fallbackFin;

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setErr(null);

    // Debug utile pour vérifier la bonne route
    // (retire ce log si tu veux)
    console.debug('[RP] fetch', { dDebut, dFin, bucket, avance });

    fetchRemplissagePonctualiteTimeline(dDebut, dFin, bucket, avance)
      .then(rows => {
        if (canceled) return;
        setData(Array.isArray(rows) ? rows : []);
      })
      .catch(e => {
        if (!canceled) setErr(e?.message || 'Erreur inconnue');
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => { canceled = true; };
  }, [dDebut, dFin, bucket, avance]);

  const title = useMemo(() => {
    const label = bucket === 'day' ? 'jour' : bucket === 'week' ? 'semaine' : 'mois';
    return `Taux de remplissage & ponctualité (${label})`;
  }, [bucket]);

  const isEmpty = !loading && !err && (data.length === 0 || data.every(p => (p.nb_exec ?? 0) === 0));

  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100 min-w-0">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-xs text-gray-500">
            Remplissage = Σ transportés / Σ capacités • Ponctualité : fin ≤ heure d’arrivée planifiée • Avance ≥ {avance} min
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
            Avance (min)
            <input
              type="number"
              min={0}
              className="w-16 border rounded px-2 py-1 text-sm"
              value={avance}
              onChange={(e) => setAvance(Number(e.target.value || 0))}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Chargement…</div>
      ) : err ? (
        <div className="text-red-600">Erreur : {err}</div>
      ) : isEmpty ? (
        <div className="text-gray-500">Aucune donnée pour la période sélectionnée.</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="bucket_label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number, name) => [`${Number(v).toFixed(2)}%`, name]} />
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
