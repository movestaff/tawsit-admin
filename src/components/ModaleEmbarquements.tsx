import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { fetchEmbarquementsByExecution } from '../lib/api';

interface Props {
  executionId: string | null;
  open: boolean;
  onClose: () => void;
  onEmployeClick: (employeId: string) => void;
}

const ModaleEmbarquements: React.FC<Props> = ({ executionId, open, onClose, onEmployeClick }) => {
  const [embarquements, setEmbarquements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (executionId && open) {
      setLoading(true);
      fetchEmbarquementsByExecution(executionId)
        .then(data => setEmbarquements(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [executionId, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl w-[95vw]">
        <h2 className="text-lg font-bold mb-4">Détails des Embarquements</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-1.5">Nom</th>
                <th className="px-3 py-1.5">Prénom</th>
                <th className="px-3 py-1.5">Tournée</th>
                <th className="px-3 py-1.5">Point d'arrêt</th>
                <th className="px-3 py-1.5">Heure Embarquement</th>
                <th className="px-3 py-1.5">Début Exécution</th>
                <th className="px-3 py-1.5">Fin Exécution</th>
              </tr>
            </thead>
            <tbody>
              {embarquements.map((emb, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-1.5">
                    {emb.employe ? (
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => onEmployeClick(emb.employe?.ID)}
                        
                      >
                        
                        {emb.employe.nom}
                      </button>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-1.5">{emb.employe?.prenom ?? '—'}</td>
                  <td className="px-3 py-1.5">{emb.tournee?.nom ?? '—'}</td>
                  <td className="px-3 py-1.5">{emb.point_arret?.nom ?? '—'}</td>
                  <td className="px-3 py-1.5">
                    {emb.date_heure ? new Date(emb.date_heure).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-3 py-1.5">
                    {emb.execution?.debut ? new Date(emb.execution.debut).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-3 py-1.5">
                    {emb.execution?.fin ? new Date(emb.execution.fin).toLocaleTimeString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
      
    </Dialog>
  );
};

export default ModaleEmbarquements;
