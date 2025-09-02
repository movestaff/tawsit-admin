import React, { useEffect, useState } from 'react';
import { KpiCard } from '../../components/Tdb/KpiCard';
import { fetchStatsMontantEtTransport } from '../../lib/api';

interface CteCardProps {
  dateDebut: string;
  dateFin: string;
}

// Réponse attendue côté API : { total_montant: number; total_employes_transportes: number; cte?: number }
interface StatsResponse {
  total_montant: number;
  total_employes_transportes: number;
  cte?: number;
}

const CteCard: React.FC<CteCardProps> = ({ dateDebut, dateFin }) => {
  const [cte, setCte] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!dateDebut || !dateFin) return;
      setLoading(true);
      setError(null);
      try {
        const data = (await fetchStatsMontantEtTransport(dateDebut, dateFin)) as unknown as StatsResponse;
        // ✅ On privilégie le CTE déjà calculé côté serveur
        if (typeof data.cte === 'number') {
          setCte(Number(data.cte));
        } else if (
          typeof data.total_montant === 'number' &&
          typeof data.total_employes_transportes === 'number' &&
          data.total_employes_transportes > 0
        ) {
          // Fallback si cte absent (sécurité)
          setCte(Number((data.total_montant / data.total_employes_transportes).toFixed(2)));
        } else {
          setCte(0);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [dateDebut, dateFin]);

  if (loading) {
    return <div className="rounded-xl bg-white shadow-soft p-4 text-gray-500">Chargement…</div>;
  }

  if (error) {
    return <div className="rounded-xl bg-white shadow-soft p-4 text-red-600">Erreur : {error}</div>;
  }

  return (
    <KpiCard
      title="CTE (coût moyen par employé)"
      value={cte !== null ? cte.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
      sub={`Période : ${dateDebut} → ${dateFin}`}
      trend="none"
    />
  );
};

export default CteCard;
