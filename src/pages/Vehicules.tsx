import { useEffect, useState } from 'react'
import { Pencil, Trash, User, List } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { toast } from 'react-toastify'
import ModalEditionVehicule from '../components/Vehicules/ModalEditionVehicule'
import ModalAffectationConducteur from '../components/Vehicules/ModalAffectationConducteur'
import { fetchVehicules, deleteVehicule } from '../lib/api'
import HistoriqueAffectation from '../components/Vehicules/HistoriqueAffectation'

function Vehicules() {
  const [vehicules, setVehicules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [modalEdit, setModalEdit] = useState(false)
  const [modalAffect, setModalAffect] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [showHistorique, setShowHistorique] = useState(false)
  const [vehiculeActif, setVehiculeActif] = useState(null)

  const openHistorique = (vehicule: any) => {
    setVehiculeActif(vehicule)
    setShowHistorique(true)
  }


  const chargerVehicules = async () => {
    setLoading(true)
    try {
      const data = await fetchVehicules()
      setVehicules(data)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerVehicules()
  }, [])

  const filteredVehicules = vehicules.filter((v) =>
    `${v.immatriculation} ${v.marque} ${v.modele} ${v.prestataires?.nom || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const vehiculesAffiches = filteredVehicules.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestion des véhicules</h1>

      <Dialog open={modalEdit} onOpenChange={(open) => {
        setModalEdit(open)
        if (!open) setSelected(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected ? 'Modifier le véhicule' : 'Créer un véhicule'}</DialogTitle>
          </DialogHeader>
          <ModalEditionVehicule
            vehicule={selected}
            onSuccess={() => {
              setModalEdit(false)
              chargerVehicules()
              setSelected(null)
            }}
            onCancel={() => {
              setModalEdit(false)
              setSelected(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modalAffect} onOpenChange={(open) => {
        setModalAffect(open)
        if (!open) setSelected(null)
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Affectation & Historique</DialogTitle>
          </DialogHeader>
          {selected && (
            <ModalAffectationConducteur
              vehicule={selected}
              onSuccess={() => {
                setModalAffect(false)
                chargerVehicules()
                setSelected(null)
              }}
              onCancel={() => {
                setModalAffect(false)
                setSelected(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un véhicule"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-neutral rounded shadow-sm w-full max-w-md focus:outline-none focus:ring focus:border-primary"
        />
        <button
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-semibold transition"
          onClick={() => {
            setModalEdit(true)
            setSelected(null)
          }}
        >
          + Nouveau véhicule
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-secondary text-left font-semibold text-gray-700">
                <th className="px-4 py-2">Immatriculation</th>
                <th className="px-4 py-2">Marque</th>
                <th className="px-4 py-2">Modèle</th>
                <th className="px-4 py-2">Capacité</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Prestataire</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehiculesAffiches.map((v) => (
                <tr key={v.id} className="border-t hover:bg-secondary/80">
                  <td className="px-4 py-2">{v.immatriculation}</td>
                  <td className="px-4 py-2">{v.marque}</td>
                  <td className="px-4 py-2">{v.modele}</td>
                  <td className="px-4 py-2">{v.capacite}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-white text-xs ${v.statut_id === 1 ? 'bg-green-600' : 'bg-gray-500'}`}>
                      {v.statut_id === 1 ? 'Disponible' : 'Indisponible'}
                    </span>
                    
                  </td>
                  <td className="px-4 py-2">{v.prestataires?.nom || '—'}</td>

                  <td className="px-4 py-2 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(v); setModalEdit(true) }}>
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(v); setModalAffect(true) }}>
                      <User className="w-5 h-5 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openHistorique(v)}><List className="w-4 h-4" /></Button> 

                    {showHistorique && vehiculeActif && (
        <Dialog open={showHistorique} onOpenChange={setShowHistorique}>
          <DialogContent>
            <HistoriqueAffectation vehicule={vehiculeActif} onClose={() => setShowHistorique(false)} />
          </DialogContent>
        </Dialog>
      )}
                    <Button size="sm" variant="ghost" onClick={async () => {
                      if (confirm('Supprimer ce véhicule ?')) {
                        try {
                          await deleteVehicule(v.id)
                          toast.success('Véhicule supprimé.')
                          chargerVehicules()
                        } catch (err: any) {
                          toast.error(err.message || 'Erreur lors de la suppression')
                        }
                      }
                    }}>
                      <Trash className="w-5 h-5 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Lignes par page :</label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setPage(1)
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
                onClick={() => setPage((p) => p * rowsPerPage < filteredVehicules.length ? p + 1 : p)}
                disabled={page * rowsPerPage >= filteredVehicules.length}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 p-2">Total : {filteredVehicules.length} véhicule(s)</p>
        </div>
      )}
    </div>
  )
}

export default Vehicules
