import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

// ✅ API centralisée
import { searchEmployes, createAbsencesBulk, getEmployeDistincts } from "../lib/api";

// ✅ UI maison
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";

type Employe = {
  ID: string;
  nom: string | null;
  prenom: string | null;
  matricule: string | null;
  departement: string | null;
  service: string | null;
  actif: boolean | null;
};

type Props = {
  onClose?: () => void;
  defaultDateDebut?: string;
  defaultDateFin?: string;
};

const PAGE_SIZE = 25;

export default function AbsencesManager({
  onClose,
  defaultDateDebut,
  defaultDateFin,
}: Props) {
  // ---- Filtres ----
  const [q, setQ] = useState("");
  const [matricule, setMatricule] = useState("");
  const [departement, setDepartement] = useState("");
  const [service, setService] = useState("");

  // ---- Dates & motif ----
  const [dateDebut, setDateDebut] = useState<string>(
    defaultDateDebut || dayjs().format("YYYY-MM-DD")
  );
  const [dateFin, setDateFin] = useState<string>(
    defaultDateFin || dayjs().format("YYYY-MM-DD")
  );
  const [motif, setMotif] = useState<string>("");

  // ---- Données ----
  const [items, setItems] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // ---- Listes pour filtres ----
  const [allDepartements, setAllDepartements] = useState<string[]>([]);
  const [allServices, setAllServices] = useState<string[]>([]);

  // ---- Sélection ----
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allSelectedOnPage = useMemo(
    () => items.length > 0 && items.every((e) => selected[e.ID]),
    [items, selected]
  );
  const someSelectedOnPage = useMemo(
    () => items.some((e) => !!selected[e.ID]),
    [items, selected]
  );
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  // ---- Helpers ----
  const canSubmit = useMemo(() => {
    if (!dateDebut || !dateFin) return false;
    if (dayjs(dateDebut).isAfter(dayjs(dateFin))) return false;
    return selectedIds.length > 0;
  }, [dateDebut, dateFin, selectedIds.length]);

  // ---- Checkbox "select all"
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = !allSelectedOnPage && someSelectedOnPage;
    }
  }, [allSelectedOnPage, someSelectedOnPage]);

  // ---- Fetch filtres
  useEffect(() => {
    (async () => {
      try {
        const { departements, services } = await getEmployeDistincts();
        setAllDepartements((departements || []).sort());
        setAllServices((services || []).sort());
      } catch (e) {
        console.error("Erreur filtres:", e);
      }
    })();
  }, []);

  // ---- Fetch employés
  const fetchEmployesPaged = async () => {
    setLoading(true);
    try {
      const { items: data, total: cnt } = await searchEmployes({
        q,
        matricule,
        departement,
        service,
        onlyActifs: true,
        page,
        limit: PAGE_SIZE,
      });
      setItems((data || []) as Employe[]);
      setTotal(cnt || 0);
    } catch (err: any) {
      console.error("Erreur employés:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployesPaged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departement, service, matricule, q, page]);

  // ---- Actions sélection ----
  const toggleOne = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleAllOnPage = (checked: boolean) => {
    const next = { ...selected };
    for (const it of items) next[it.ID] = checked;
    setSelected(next);
  };
  const clearSelection = () => setSelected({});

  // ---- Submit ----
  const submitAbsences = async () => {
    if (!canSubmit) return;
    const payload = selectedIds.map((employe_id) => ({
      employe_id,
      date_debut: dateDebut,
      date_fin: dateFin,
      motif: motif || undefined,
    }));
    try {
      await createAbsencesBulk(payload);
      clearSelection();
      setMotif("");
      onClose?.();
    } catch (err: any) {
      console.error("Erreur submit:", err?.message || err);
      alert(err?.message || "Erreur lors de l'enregistrement.");
    }
  };

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="w-full relative">
      {/* Bouton Fermer en haut à droite */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 px-2 py-1 text-sm rounded border border-primary/30 text-primary bg-white hover:bg-primary/5"
        >
          Fermer
        </button>
      )}

      <h3 className="text-lg font-semibold mb-2"></h3>

      {/* Filtres */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3">
          <label className="block text-sm mb-1">Recherche</label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom / prénom" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">Matricule</label>
          <Input value={matricule} onChange={(e) => setMatricule(e.target.value)} />
        </div>
        <div className="col-span-3">
          <label className="block text-sm mb-1">Département</label>
          <Select value={departement} onChange={(e) => setDepartement((e.target as any).value)}>
            <option value="">Tous</option>
            {allDepartements.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </div>
        <div className="col-span-3">
          <label className="block text-sm mb-1">Service</label>
          <Select value={service} onChange={(e) => setService((e.target as any).value)}>
            <option value="">Tous</option>
            {allServices.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Dates + Motif + Boutons alignés */}
      <div className="col-span-8 col-start-1 flex items-center gap-4">
  {/* Champ Date début */}
  <input
    type="date"
    className="border rounded px-2 py-1"
  />

  {/* Champ Date fin */}
  <input
    type="date"
    className="border rounded px-2 py-1"
  />

  {/* Champ Motif */}
  <input
    type="text"
    placeholder="Motif"
    className="border rounded px-2 py-1 w-48"
  />

  {/* Boutons */}
  <div className="flex items-center gap-2 ml-auto">
    <Button variant="outline" onClick={clearSelection}>
      Réinitialiser
    </Button>
    <Button onClick={submitAbsences} disabled={!canSubmit}>
      Valider
    </Button>
    {onClose && (
      <Button variant="outline" type="button" onClick={onClose}>
        Fermer
      </Button>
    )}
  </div>
</div>


      {/* Table */}
      <div className="border rounded overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={(e) => toggleAllOnPage(e.target.checked)}
                  />
                </th>
                <th className="px-3 py-2 text-left">Matricule</th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Prénom</th>
                <th className="px-3 py-2 text-left">Département</th>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-left">Actif</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4">Chargement…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4">Aucun employé trouvé</td></tr>
              ) : (
                items.map((e) => (
                  <tr key={e.ID} className="border-t">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!selected[e.ID]}
                        onChange={() => toggleOne(e.ID)}
                      />
                    </td>
                    <td className="px-3 py-2">{e.matricule || "-"}</td>
                    <td className="px-3 py-2">{e.nom || "-"}</td>
                    <td className="px-3 py-2">{e.prenom || "-"}</td>
                    <td className="px-3 py-2">{e.departement || "-"}</td>
                    <td className="px-3 py-2">{e.service || "-"}</td>
                    <td className="px-3 py-2">{e.actif ? "Actif" : "Inactif"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between px-3 py-2 bg-gray-50 border-t text-sm">
          <div>Page {page}/{totalPages} · {total} employés</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!canPrev} onClick={() => setPage(p => p - 1)}>Précédent</Button>
            <Button variant="outline" disabled={!canNext} onClick={() => setPage(p => p + 1)}>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
