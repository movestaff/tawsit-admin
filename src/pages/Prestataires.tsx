
import { useEffect, useState } from 'react';
import {
  fetchPrestataires,
  ajouterPrestataire,
  updatePrestataire,
  deletePrestataire,
} from '../lib/api';
import { Pencil, Trash } from 'lucide-react';
import ModalEditionPrestataire from '../components/Prestataires/ModalEditionPrestataire';
import type { Prestataire } from '../components/Prestataires/ModalEditionPrestataire';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Prestataires() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [filtered, setFiltered] = useState<Prestataire[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Prestataire | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadPrestataires = async () => {
    try {
      setLoading(true);
      const data = await fetchPrestataires();
      setPrestataires(data);
      setFiltered(data);
    } catch (e) {
      toast.error('Erreur lors du chargement des prestataires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrestataires();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      prestataires.filter((p) =>
        [
          p.nom,
          p.telephone,
          p.email,
          p.responsable,
          p.id_fiscale,
          p.actif ? 'actif' : 'inactif',
        ].some((v) => v?.toLowerCase().includes(term))
      )
    );
    setPage(1);
  }, [search, prestataires]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Confirmer la suppression ?')) return;
    try {
      await deletePrestataire(id);
      toast.success('Prestataire supprimé');
      await loadPrestataires();
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSave = async (data: Prestataire) => {
    if (selected?.id) {
      await updatePrestataire(selected.id, data);
    } else {
      await ajouterPrestataire(data);
    }
    await loadPrestataires();
  };

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const renderCell = (value: string | undefined) => value ?? '-';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestion des prestataires</h1>

<div className="flex flex-wrap items-center gap-4 mb-6">
  <input
    type="text"
    placeholder="🔍 Rechercher un prestataire"
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
    + Nouveau prestataire
  </button>
</div>


      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Nom</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Téléphone</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Responsable</th>
              <th className="px-4 py-2 text-left text-sm font-medium">ID Fiscale</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
              <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">{renderCell(p.nom)}</td>
                <td className="px-4 py-2">{renderCell(p.telephone)}</td>
                <td className="px-4 py-2">{renderCell(p.email)}</td>
                <td className="px-4 py-2">{renderCell(p.responsable)}</td>
                <td className="px-4 py-2">{renderCell(p.id_fiscale)}</td>
                <td className="px-4 py-2">
                  <span
  className={`px-2 py-1 rounded-full text-xs font-semibold ${
    p.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  }`}
>
  {p.actif ? 'Actif' : 'Inactif'}
</span>
                </td>
                <td className="px-4 py-2 text-center space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => { setSelected(p); setModalOpen(true); }}>
                    <Pencil className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                    <Trash className="w-5 h-5 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm px-2 py-1 border rounded disabled:opacity-50"
          >
            ◀ Précédent
          </button>
          <span className="text-sm">Page {page}</span>
          <button
            onClick={() => setPage((p) => p * rowsPerPage < filtered.length ? p + 1 : p)}
            disabled={page * rowsPerPage >= filtered.length}
            className="text-sm px-2 py-1 border rounded disabled:opacity-50"
          >
            Suivant ▶
          </button>
        </div>
      </div>

      <ModalEditionPrestataire
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={selected}
      />
    </div>
  );
}
