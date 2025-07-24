import { useEffect, useState } from 'react';
import { fetchPlanifications, fetchTournees, deletePlanification } from '../lib/api';
import ModalPlanification from '../components/ModalPlanification';
import ListePlanifications from '../components/ListePlanifications';
import { Button } from '../components/ui/button';
import { toast } from 'react-toastify';

export default function Planification() {
  const [planifications, setPlanifications] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tournees, setTournees] = useState<any[]>([]);

  const loadPlanifications = async () => {
    try {
      setLoading(true);
      const [plans, tours] = await Promise.all([
        fetchPlanifications(),
        fetchTournees(),
      ]);
      setPlanifications(plans);
      setFiltered(plans);
      setTournees(tours);
    } catch {
      toast.error('Erreur lors du chargement des planifications');
    } finally {
      setLoading(false);
    }
  };

 const handleDelete = (id: string) => {
  if (!id) return;

  // Afficher un toast custom avec des boutons
  toast.info(
    ({ closeToast }) => (
      <div className="space-y-2">
        <div className="font-semibold">❗️ Confirmer la suppression</div>
        <div className="text-sm text-gray-600">Cette action est irréversible.</div>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
            onClick={async () => {
              closeToast();
              setLoading(true);
              try {
                await deletePlanification(id);
                toast.success('✅ Planification supprimée avec succès');
                await loadPlanifications();
              } catch (error: any) {
                console.error(error);
                toast.error(`❌ Erreur serveur : ${error?.message || 'Erreur inconnue'}`);
              } finally {
                setLoading(false);
              }
            }}
          >
            Supprimer
          </button>
          <button
            className="border px-3 py-1 rounded hover:bg-neutral-100 transition"
            onClick={closeToast}
          >
            Annuler
          </button>
        </div>
      </div>
    ),
    { autoClose: false, closeOnClick: false }
  );
};


  useEffect(() => {
    loadPlanifications();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      planifications.filter((p) =>
        [
          p.tournee?.nom,
          p.recurrence_type,
          p.heure_depart,
          p.heure_arrivee,
          p.active ? 'active' : 'inactive',
          p.tournee?.conducteur_nom,
        ].some((v) => v?.toLowerCase().includes(term))
      )
    );
    setPage(1);
  }, [search, planifications]);

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Liste des planifications</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher une planification"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-neutral rounded shadow-sm w-full max-w-md focus:outline-none focus:ring focus:border-primary"
        />

        <button
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-semibold transition"
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        >
          + Nouvelle planification
        </button>
      </div>

      <ListePlanifications
        planifications={paginated}
        onEdit={(p) => {
          setSelected(p);
          setModalOpen(true);
        }}
        onDuplicate={(p) => {
          setSelected(p);
          setModalOpen(true);
        }}
        onDelete= {handleDelete}
        onRefresh={loadPlanifications}
        filtreTexte={search}
      />

      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Lignes par page :</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border px-2 py-1 rounded text-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="text-sm">
          Page {page} sur {totalPages}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="ml-2 px-2 py-1 border rounded"
            disabled={page === 1}
          >
            ◀
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="ml-2 px-2 py-1 border rounded"
            disabled={page === totalPages}
          >
            ▶
          </button>
        </div>
      </div>

      <ModalPlanification
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRefresh={loadPlanifications}
        planification={selected}
        tournees={tournees}
      />
    </div>
  );
}
