import { useEffect, useMemo, useState } from 'react';
import { fetchCoutsTourneesTimeline } from '../../lib/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

type Bucket = 'day' | 'week' | 'month';

type TimelinePoint = {
  bucket_label: string;
  bucket_date: string; // ISO date
  nb_tournees: number;
  montant_total: number;
  cout_moyen: number;
};

type Props = {
  dateDebut: string;
  dateFin: string;
  /** Mode contrôlé (facultatif) : force le bucket depuis le parent */
  bucket?: Bucket;
  /** Callback (facultatif) : notifie le parent d’un changement de bucket */
  onBucketChange?: (b: Bucket) => void;
  /** Valeur initiale si non contrôlé */
  defaultBucket?: Bucket;
};

export default function ToursCostTimeline({
  dateDebut,
  dateFin,
  bucket,
  onBucketChange,
  defaultBucket = 'day',
}: Props) {
  // Mode contrôlé / non contrôlé
  const [localBucket, setLocalBucket] = useState<Bucket>(defaultBucket);
  const effectiveBucket = bucket ?? localBucket;

  const [data, setData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Sync si parent contrôle
  useEffect(() => {
    if (bucket) setLocalBucket(bucket);
  }, [bucket]);

  useEffect(() => {
    if (!dateDebut || !dateFin) return;
    let cancelled = false;

    setLoading(true);
    setErr(null);
    fetchCoutsTourneesTimeline(dateDebut, dateFin, effectiveBucket)
      .then((rows) => {
        if (cancelled) return;
        // Sécurité typings
        const clean = (rows || []).map((r: any) => ({
          bucket_label: String(r.bucket_label ?? ''),
          bucket_date: String(r.bucket_date ?? ''),
          nb_tournees: Number(r.nb_tournees ?? 0),
          montant_total: Number(r.montant_total ?? 0),
          cout_moyen: Number(r.cout_moyen ?? 0),
        })) as TimelinePoint[];
        setData(clean);
      })
      .catch((e) => setErr(e?.message || 'Erreur inconnue'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [dateDebut, dateFin, effectiveBucket]);

  const title = useMemo(() => {
    const label =
      effectiveBucket === 'day' ? 'jour'
      : effectiveBucket === 'week' ? 'semaine'
      : 'mois';
    return `Évolution du coût moyen par tournée (${label})`;
  }, [effectiveBucket]);

  const changeBucket = (b: Bucket) => {
    if (bucket) {
      // mode contrôlé : on notifie uniquement
      onBucketChange?.(b);
    } else {
      setLocalBucket(b);
      onBucketChange?.(b);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500">{title}</div>
        {/* Sélecteur bucket */}
        <div className="inline-flex rounded-lg border bg-white overflow-hidden">
          {(['day','week','month'] as Bucket[]).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => changeBucket(b)}
              className={[
                'px-3 py-1 text-sm',
                effectiveBucket === b ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100',
              ].join(' ')}
            >
              {b === 'day' ? 'Jour' : b === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-3 text-gray-400">Chargement…</div>
      ) : err ? (
        <div className="mt-3 text-red-600">Erreur : {err}</div>
      ) : (
        <div className="h-56 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket_label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cout_moyen" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
