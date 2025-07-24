import { useEffect, useState } from 'react';
import { fetchPlanifications } from '../lib/api';
import CalendrierPlanifications from '../components/CalendrierPlanifications';
import { toast } from 'sonner';

export default function Calendrier() {
  const [planifications, setPlanifications] = useState<any[]>([]);
  const [filtreTexte, setFiltreTexte] = useState<string>('');
  const [filtreType, setFiltreType] = useState<string>('');
  const [filtreStatut, setFiltreStatut] = useState<string>('');

  const loadPlanifications = async () => {
    try {
      const data = await fetchPlanifications();
      setPlanifications(data);
    } catch {
      toast.error('Erreur lors du chargement des planifications');
    }
  };

  useEffect(() => {
    loadPlanifications();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6"> Calendrier des planifications</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Filtrer par tournée ou conducteur"
          value={filtreTexte}
          onChange={(e) => setFiltreTexte(e.target.value)}
          className="px-3 py-2 border border-neutral rounded shadow-sm w-full max-w-md focus:outline-none focus:ring focus:border-primary"
        />
      </div>

      <CalendrierPlanifications
        planifications={planifications}
        filtreTexte={filtreTexte}
        filtreType={filtreType}
        filtreStatut={filtreStatut}
      />
    </div>
  );
}
