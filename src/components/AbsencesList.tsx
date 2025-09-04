import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { searchAbsences, updateAbsence, deleteAbsence } from "../lib/api";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";

type AbsenceRow = {
  id: string;
  employe_id: string;
  date_debut: string;
  date_fin: string;
  motif?: string | null;
  // si l'API renvoie l'objet employé joint
  employe?: { ID: string; nom?: string; prenom?: string; matricule?: string; departement?: string; service?: string };
};

type Props = {
  onClose?: () => void;
};

const PAGE = 25;

export default function AbsencesList({ onClose }: Props) {
  // Filtres
  const [from, setFrom] = useState<string>(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [to, setTo] = useState<string>(dayjs().endOf("month").format("YYYY-MM-DD"));
  const [q, setQ] = useState("");
  const [matricule, setMatricule] = useState("");
  const [departement, setDepartement] = useState("");
  const [service, setService] = useState("");

  // Data
  const [rows, setRows] = useState<AbsenceRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Edition inline
  const [editId, setEditId] = useState<string | null>(null);
  const [editDebut, setEditDebut] = useState("");
  const [editFin, setEditFin] = useState("");
  const [editMotif, setEditMotif] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { items, total: cnt } = await searchAbsences({
        from, to, q, matricule, departement, service, page, limit: PAGE
      });
      setRows(items || []);
      setTotal(cnt || 0);
    } catch (e:any) {
      console.error(e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, q, matricule, departement, service, page]);

  const startEdit = (r: AbsenceRow) => {
    setEditId(r.id);
    setEditDebut(r.date_debut);
    setEditFin(r.date_fin);
    setEditMotif(r.motif || "");
  };

  const saveEdit = async () => {
    if (!editId) return;
    await updateAbsence(editId, { date_debut: editDebut, date_fin: editFin, motif: editMotif || undefined });
    setEditId(null);
    fetchRows();
  };

  const remove = async (id: string) => {
    if (!confirm("Confirmer la suppression ?")) return;
    await deleteAbsence(id);
    fetchRows();
  };

  const resetFilters = () => {
    setFrom(dayjs().startOf("month").format("YYYY-MM-DD"));
    setTo(dayjs().endOf("month").format("YYYY-MM-DD"));
    setQ(""); setMatricule(""); setDepartement(""); setService(""); setPage(1);
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">Absences déclarées</h3>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">De</label>
          <Input type="date" value={from} onChange={(e)=>{ setPage(1); setFrom(e.target.value); }} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">À</label>
          <Input type="date" value={to} onChange={(e)=>{ setPage(1); setTo(e.target.value); }} />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm mb-1">Recherche (nom/prénom)</label>
          <Input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }} placeholder="ex: Ahmed" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Matricule</label>
          <Input value={matricule} onChange={(e)=>{ setPage(1); setMatricule(e.target.value); }} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Département</label>
          <Select value={departement} onChange={(e)=>{ setPage(1); setDepartement(e.target.value); }}>
            <option value="">Tous</option>
            {/* Optionnel: injecter ici tes listes distinctes si tu veux */}
          </Select>
        </div>
        <div className="md:col-span-12 flex gap-2">
          <Button onClick={fetchRows}>Rechercher</Button>
          <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
          {onClose && <Button variant="outline" onClick={onClose}>Fermer</Button>}
        </div>
      </div>

      {/* Liste */}
      <div className="border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left">Employé</th>
                <th className="px-3 py-2 text-left">Matricule</th>
                <th className="px-3 py-2 text-left">Période</th>
                <th className="px-3 py-2 text-left">Motif</th>
                <th className="px-3 py-2 text-left w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Chargement...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Aucune absence.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">
                    {r.employe
                      ? `${r.employe.nom || ''} ${r.employe.prenom || ''}`.trim() || r.employe_id
                      : r.employe_id}
                  </td>
                  <td className="px-3 py-2">{r.employe?.matricule || "-"}</td>
                  <td className="px-3 py-2">
                    {editId === r.id ? (
                      <div className="flex gap-2">
                        <Input type="date" value={editDebut} onChange={(e)=>setEditDebut(e.target.value)} />
                        <Input type="date" value={editFin} onChange={(e)=>setEditFin(e.target.value)} />
                      </div>
                    ) : (
                      <>
                        {r.date_debut} → {r.date_fin}
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editId === r.id ? (
                      <Input value={editMotif} onChange={(e)=>setEditMotif(e.target.value)} placeholder="Motif" />
                    ) : (r.motif || "-")}
                  </td>
                  <td className="px-3 py-2">
                    {editId === r.id ? (
                      <div className="flex gap-2">
                        <Button onClick={saveEdit}>Enregistrer</Button>
                        <Button variant="outline" onClick={()=>setEditId(null)}>Annuler</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={()=>startEdit(r)}>Modifier</Button>
                        <Button variant="destructive" onClick={()=>remove(r.id)}>Supprimer</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t">
          <div className="text-xs text-gray-500">Page {page}/{totalPages} · {total} élément(s)</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Précédent</Button>
            <Button variant="outline" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
