import React, { useEffect, useState } from 'react';
import { fetchExecutions } from '../lib/api';
import Badge from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Eye } from 'lucide-react';
import FormulairePlanification from '../components/FormulairePlanification';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import ModalIncident from '../components/ModalIncident'
import TransfertTourneeWizard from '../components/TransfertTourneeWizard'
import ModaleEmbarquements from '../components/ModaleEmbarquements';
import FormulaireEmploye from '../components/FormulaireEmploye';
import { fetchEmployeById } from '../lib/api';
import { CalendarDays, AlertTriangle, Users } from 'lucide-react';
import { Tooltip} from '../components/ui/tooltip'




function ListeExecutionsTournees() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openPlanifId, setOpenPlanifId] = useState<string | null>(null);
  const [transfertOpen, setTransfertOpen] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<any>(null);
  const [embarquementModalOpen, setEmbarquementModalOpen] = useState(false);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [employeModalOpen, setEmployeModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<any | null>(null);


  const ouvrirEmbarquements = (executionId: string) => {
    setSelectedExecutionId(executionId);
    setEmbarquementModalOpen(true);
  };

  const fermerEmbarquements = () => {
    setSelectedExecutionId(null);
    setEmbarquementModalOpen(false);
  };

const afficherEmploye = async (employeId: string) => {
  setEmployeModalOpen(true);
  setSelectedEmploye(null); // <- vide avant fetch !
  try {
    const employe = await fetchEmployeById(employeId);
     console.log("Valeur retournée par fetchEmployeById :", employe);
    setSelectedEmploye(employe);
  } catch (e) {
    //setEmployeModalOpen(false);
    alert("Erreur lors du chargement de l'employé.");
  }
};


  // Ajout pour la modale incident
 const [incidentOpen, setIncidentOpen] = useState(false);
const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetchExecutions()
      .then(setExecutions)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = executions.filter((e) =>
    `${e.tournee?.nom ?? ''} ${e.conducteur?.display_name ?? ''} ${e.statut ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'terminée':
        return 'bg-green-100 text-green-700';
      case 'interrompue':
        return 'bg-red-100 text-red-700';
      case 'en_cours':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  {console.log("selectedEmploye dans le render :", selectedEmploye)}


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Suivi des exécutions de tournées</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher par tournée, conducteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-neutral rounded shadow-sm w-full max-w-md focus:outline-none focus:ring focus:border-primary"
        />
      </div>

      {loading ? (
        <p className="text-gray-600">Chargement en cours...</p>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
          <table className="min-w-full text-sm text-gray-800">
           <thead>
              <tr className="bg-secondary text-left font-semibold text-gray-700">
                <th className="px-3 py-1.5">Tournée</th>
                <th className="px-3 py-1.5">Conducteur</th>
                <th className="px-3 py-1.5">Date</th>
                <th className="px-3 py-1.5">Début</th>
                <th className="px-3 py-1.5">Fin</th>
                <th className="px-3 py-1.5">Statut</th>
                <th className="px-3 py-1.5">Actions</th>
                <th className="px-3 py-1.5">Transfert</th>
              </tr>
            </thead>
                 <tbody>
                    {paginated.map((exec) => (
                      <tr key={exec.id} className="border-t hover:bg-secondary/80">
                        <td className="px-3 py-1.5 whitespace-nowrap">{exec.tournee?.nom ?? '—'}</td>
                        <td className="px-3 py-1.5 whitespace-nowrap">{exec.conducteur?.display_name ?? '—'}</td>
                        <td className="px-3 py-1.5 whitespace-nowrap">{exec.date}</td>
                        <td className="px-3 py-1.5 whitespace-nowrap">{exec.debut?.slice(11, 16) ?? '—'}</td>
                        <td className="px-3 py-1.5 whitespace-nowrap">{exec.fin?.slice(11, 16) ?? '—'}</td>
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          <Badge className={getStatutColor(exec.statut)}>{exec.statut}</Badge>
                        </td>
                        {/* -------- COLONNE ACTIONS -------- */}
                        <td className="px-3 py-1.5 flex gap-2">
  {/* Planification */}
  <Tooltip label="Voir planification">
    <span className="inline-block">
      <Button size="sm" variant="ghost"  onClick={() => setOpenPlanifId(exec.id_planification)}>
        <CalendarDays className="w-4 h-4 text-primary" />
      </Button>
    </span>
  </Tooltip>
  {/* Incident */}
  <Tooltip label={Array.isArray(exec.incident) && exec.incident.length > 0 ? "Voir incident(s)" : "Aucun incident"}>
    <span className="inline-block">
      <Button
        size="sm"
        variant="ghost"
        onClick={
          Array.isArray(exec.incident) && exec.incident.length > 0
            ? () => { setIncidents(exec.incident); setIncidentOpen(true); }
            : undefined
        }
        disabled={!Array.isArray(exec.incident) || exec.incident.length === 0}
        tabIndex={-1}
        type="button"
      >
        <AlertTriangle
          className={`w-4 h-4 ${Array.isArray(exec.incident) && exec.incident.length > 0
            ? "text-orange-500"
            : "text-gray-300"
          }`}
        />
      </Button>
    </span>
  </Tooltip>
  {/* Embarquement */}
  <Tooltip label="Voir embarquements">
    <span className="inline-block">
      <Button variant="ghost" size="sm" onClick={() => ouvrirEmbarquements(exec.id)}>
        <Users className="w-4 h-4" />
      </Button>
    </span>
  </Tooltip>
</td>

                        {/* -------- COLONNE TRANSFERT -------- */}
                        <td className="px-3 py-1.5">
                          {exec.statut === 'interrompue' && (
                            <a
                              href="#"
                              className="text-primary underline cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentExecution(exec);
                                setTransfertOpen(true);
                              }}
                            >
                              transférer la tournée
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
          </table>

          <ModaleEmbarquements
  executionId={selectedExecutionId}
  open={embarquementModalOpen}
  onClose={fermerEmbarquements}
  onEmployeClick={afficherEmploye}
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
                onClick={() =>
                  setPage((p) =>
                    p * rowsPerPage < filtered.length ? p + 1 : p
                  )
                }
                disabled={page * rowsPerPage >= filtered.length}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 p-2">Total : {filtered.length} exécution(s)</p>
        </div>
      )}

      <Dialog open={!!openPlanifId} onOpenChange={() => setOpenPlanifId(null)}>
        <DialogContent className="max-w-5xl w-[95vw]">
          <DialogTitle>Détails Planification</DialogTitle>
          {openPlanifId && (
            <FormulairePlanification
              id={openPlanifId}
              readonly
              tournees={[]}
              onSuccess={() => { /* ... */ }}
              onCancel={() => { /* ... */ }}
            />
          )}
        </DialogContent>
            </Dialog>

<Dialog open={employeModalOpen} onOpenChange={() => setEmployeModalOpen(false)}>
  <DialogContent className="!max-w-5xl w-[90vw]">
    <DialogTitle>fiche employé</DialogTitle>
    {selectedEmploye ? (
      <FormulaireEmploye
        employe={selectedEmploye}
        onSuccess={() => setEmployeModalOpen(false)}
        onCancel={() => setEmployeModalOpen(false)}
        readonly
      />
    ) : (
      <div className="text-center py-8">Chargement des données employé...</div>
    )}
  </DialogContent>
</Dialog>


                  {/* MODALE INCIDENT */}
                <ModalIncident
              open={incidentOpen}
              incidents={incidents}
              onClose={() => setIncidentOpen(false)}
            />

                  {transfertOpen && currentExecution && (
                    <TransfertTourneeWizard
                      open={transfertOpen}
                      execution={currentExecution}
                      onClose={() => setTransfertOpen(false)}
                      onSuccess={() => {
                        setTransfertOpen(false);
                        fetchExecutions().then(setExecutions);
                      }}
                      tourneeId={
                        currentExecution.tournee?.id || currentExecution.tournee_id
                      }
                    />
                  )}


             </div>

             
  );
}

export default ListeExecutionsTournees;
