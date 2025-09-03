import { useEffect, useState } from 'react';
import { fetchStatsCoutsTournees } from '../../lib/api';

type Props = { dateDebut: string; dateFin: string };

export default function ToursCostCard({ dateDebut, dateFin }: Props) {
  const [data, setData] = useState<{
    total_montant: number;
    nb_tournees: number;
    cout_moyen_par_tournee: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!dateDebut || !dateFin) return;

    setLoading(true);
    setErr(null);

    fetchStatsCoutsTournees(dateDebut, dateFin)
      .then((d) => setData(d))
      .catch((e) => setErr(e?.message || 'Erreur inconnue'))
      .finally(() => setLoading(false));
  }, [dateDebut, dateFin]);

  return (
    <div className="bg-white rounded-xl shadow-soft p-4">
      <div className="text-sm text-gray-500">Coût moyen par tournée</div>
      {loading ? (
        <div className="mt-2 text-gray-400">Chargement…</div>
      ) : err ? (
        <div className="mt-2 text-red-600">Erreur : {err}</div>
      ) : data ? (
        <>
          <div className="mt-1 text-2xl font-semibold">
            {data.cout_moyen_par_tournee.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Tournées terminées : {data.nb_tournees.toLocaleString()} • Total :{' '}
            {data.total_montant.toLocaleString()}
          </div>
        </>
      ) : (
        <div className="mt-2 text-gray-400">Aucune donnée</div>
      )}
    </div>
  );
}
