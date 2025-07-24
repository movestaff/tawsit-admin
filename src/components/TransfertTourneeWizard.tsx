import React, { useState, useMemo, useEffect } from "react";
import { DateTime } from "luxon";
import { fetchConducteurs, ajouterPlanification, createExecution } from "../lib/api";
import { updateTournee } from "../lib/api";
import { useUserProfile } from "../lib/hooks/useUserProfile";
import { updateExecutionStatus } from "../lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  tourneeId: string;
  execution: any;
  onSuccess?: () => void;
};

const DUREE_MINUTES = 60;

export default function TransfertTourneeWizard({
  open,
  onClose,
  tourneeId,
  execution,
  onSuccess,
}: Props) {
  const { profile, loading: profileLoading } = useUserProfile();

  const [step, setStep] = useState(1);
  const [conducteurs, setConducteurs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [loadingConducteurs, setLoadingConducteurs] = useState(false);

  const [loadingAffectation, setLoadingAffectation] = useState(false);
  const [errorAffectation, setErrorAffectation] = useState<string | null>(null);

  const [loadingPlanif, setLoadingPlanif] = useState(false);
  const [errorPlanif, setErrorPlanif] = useState<string | null>(null);
  const [initialConducteurId, setInitialConducteurId] = useState<string | null>(null);



  const userTimezone = useMemo(() => {
    if (profile?.timezone && profile.timezone !== "UTC") return profile.timezone;
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }, [profile]);

  const dateTimeRef = useMemo(() => {
    const now = DateTime.now().setZone(userTimezone);
    return now;
  }, [userTimezone]);


useEffect(() => {
  if (open && execution) {
    // Cherche le conducteur id dans l'objet execution
    let idInit =
      execution.conducteur_id ||
      execution.conducteur?.id ||
      null;
    setInitialConducteurId(idInit);
  }
}, [open, execution]);



  useEffect(() => {
    if (!open) return;
    setLoadingConducteurs(true);
    fetchConducteurs()
      .then(setConducteurs)
      .catch(() => setConducteurs([]))
      .finally(() => setLoadingConducteurs(false));
  }, [open]);

  const filteredConducteurs = useMemo(() => {
    if (!search) return conducteurs;
    return conducteurs.filter((c) =>
      c.display_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, conducteurs]);

  async function handleAffecterConducteur() {
    if (!selected) return;
    setLoadingAffectation(true);
    setErrorAffectation(null);
    try {
      await updateTournee(tourneeId, { conducteur_id: selected.id });
      setStep(2);
    } catch (err: any) {
      setErrorAffectation(
        err?.message || "Erreur lors de l'affectation du conducteur à la tournée."
      );
    } finally {
      setLoadingAffectation(false);
    }
  }

  async function handleCreatePlanif() {
    if (!selected) return;
    setLoadingPlanif(true);
    setErrorPlanif(null);

    try {
      const dateJour = dateTimeRef.toISODate()!;
      const debut = dateTimeRef.toFormat("HH:mm");
      const fin = dateTimeRef.plus({ minutes: DUREE_MINUTES }).toFormat("HH:mm");
      const debutUTC = dateTimeRef.toUTC().toISO();

      const planifObj = {
        tournee_id: tourneeId,
        conducteur_id: selected.id,
        date_unique: dateJour,
        heure_depart: debut,
        heure_arrivee: fin,
        recurrence_type: "unique",
        active: true,
      };
      const planifRes = await ajouterPlanification(planifObj);

     const debutLocalStr = dateTimeRef.toFormat("yyyy-MM-dd'T'HH:mm:ss");
const finLocalStr = dateTimeRef.plus({ minutes: DUREE_MINUTES }).toFormat("yyyy-MM-dd'T'HH:mm:ss");


const execObj = {
  tournee_id: tourneeId,
  conducteur_id: selected.id,
  date: dateJour,
  debut: debutLocalStr, 
  
  id_planification: planifRes.id,
  statut: "en_cours",
  execution_parent_id: execution.id,
};



      await createExecution(execObj);
      await updateExecutionStatus(execution.id, "cloturee_par_transfert");

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorPlanif(
        err?.message || "Erreur lors de la création de la planification."
      );
    } finally {
      setLoadingPlanif(false);
    }
  }

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSearch("");
      setSelected(null);
      setErrorAffectation(null);
      setErrorPlanif(null);
    }
  }, [open]);

  if (profileLoading && open) {
    return (
      <div className="flex items-center justify-center p-8 text-lg">
        Chargement du profil...
      </div>
    );
  }

async function handlePrecedentEtape2() {
  console.log('handlePrecedentEtape2 called', { initialConducteurId, selected, conducteurs });
  if (!initialConducteurId) {
    setStep(1);
    return;
  }
  try {
    await updateTournee(tourneeId, { conducteur_id: initialConducteurId });
    setSelected(conducteurs.find(c => c.id === initialConducteurId) || null);
    console.log("Reset conducteur à :", initialConducteurId);
  } catch (e) {
    console.warn("Erreur rollback conducteur :", e);
  }
  setStep(1);
}




  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-8">
        <h2 className="text-xl font-bold mb-2">
          Transfert de tournée (étape {step}/2)
        </h2>
        {step === 1 && (
          <>
            <div className="mb-2">Sélectionnez un conducteur :</div>
            <input
              type="text"
              placeholder="Rechercher par nom"
              className="border rounded px-2 py-1 w-full mb-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto border rounded mb-3">
              {loadingConducteurs ? (
                <div className="p-4 text-center text-gray-500">
                  Chargement...
                </div>
              ) : filteredConducteurs.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Aucun conducteur
                </div>
              ) : (
                filteredConducteurs.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                      selected?.id === c.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelected(c)}
                  >
                    <span className="flex-1">{c.display_name}</span>
                    {selected?.id === c.id && (
                      <span className="ml-2 text-blue-600 font-semibold">
                        ✓
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* --- Ligne boutons : Annuler à gauche, Suivant à droite --- */}
            <div className="flex justify-between items-center mt-6 gap-4">
              <button
                className="text-gray-500 underline"
                onClick={onClose}
                type="button"
              >
                Annuler
              </button>
              <button
                className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50"
                disabled={!selected || loadingAffectation}
                onClick={handleAffecterConducteur}
                type="button"
              >
                {loadingAffectation ? "Affectation en cours..." : "Suivant"}
              </button>
            </div>
            {errorAffectation && (
              <div className="text-red-600 text-sm mt-2">{errorAffectation}</div>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <div className="mb-2">
              <b>Conducteur sélectionné :</b> {selected?.display_name}
            </div>
            <div className="mb-2">
              <b>Créneau :</b>{" "}
              {dateTimeRef.toLocaleString(DateTime.DATE_SHORT)} —{" "}
              {dateTimeRef.toFormat("HH:mm")} à{" "}
              {dateTimeRef.plus({ minutes: DUREE_MINUTES }).toFormat("HH:mm")}
              <span className="ml-2 text-gray-400 text-xs">
                ({userTimezone})
              </span>
            </div>

            {/* --- Ligne boutons : Précédent à gauche, Créer/Transférer à droite --- */}
            <div className="flex justify-between items-center mt-6 gap-4">
           
   <button
  className="text-gray-500 underline"
  onClick={handlePrecedentEtape2}
  disabled={loadingPlanif}
  type="button"
>
  Précédent
</button>


              <button
                className="bg-primary text-white rounded px-4 py-2 disabled:opacity-50"
                onClick={handleCreatePlanif}
                disabled={loadingPlanif}
                type="button"
              >
                {loadingPlanif
                  ? "Création de la planification..."
                  : "Créer et transférer"}
              </button>
            </div>
            {errorPlanif && (
              <div className="text-red-600 text-sm mt-2">{errorPlanif}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
