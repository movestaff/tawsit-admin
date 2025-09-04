import React, { useEffect, useState } from 'react'
import { fetchTournees, fetchConducteurs, deleteTournee, fetchSites } from '../lib/api'
import FormulaireTournee from '../components/FormulaireTournee'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog'
import ListePointsArret from '../components/ListePointsArret'
import ListeEmployesAffectesTournee from '../components/ListeEmployesAffectesTournee'
import { Button } from '../components/ui/button'
import { Pencil, Trash, MapPin, Users } from 'lucide-react'
import AbsencesManager from '../components/AbsencesManager'
import AbsencesList from '../components/AbsencesList'
import dayjs from 'dayjs'

function Tournees() {
  const [tournees, setTournees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('nom')
  const [sortAsc, setSortAsc] = useState(true)
  const [formVisible, setFormVisible] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [conducteurs, setConducteurs] = useState<any[]>([])
  const [pointsModal, setPointsModal] = useState(false)
  const [employesModal, setEmployesModal] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sites, setSites] = useState<Record<string, string>>({})
 
  const [absencesModal, setAbsencesModal] = useState(false)
  const [absDateDebut, setAbsDateDebut] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [absDateFin, setAbsDateFin] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [absListModal, setAbsListModal] = useState(false)


  const chargerTournees = async () => {
    setLoading(true)
    try {
      const data = await fetchTournees()
      setTournees(data)
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerTournees()
  }, [])

  useEffect(() => {
    const chargerConducteurs = async () => {
      try {
        const data = await fetchConducteurs()
        setConducteurs(data)
      } catch (e) {
        console.error('❌ Erreur chargement conducteurs', e)
      }
    }
    chargerConducteurs()
  }, [])

  useEffect(() => {
    const chargerSites = async () => {
      try {
        const data = await fetchSites()
        const mapping: Record<string, string> = {}
        data.forEach((site: any) => {
          mapping[site.id] = site.nom
        })
        setSites(mapping)
      } catch (err) {
        console.error('Erreur chargement sites', err)
      }
    }
    chargerSites()
  }, [])

  useEffect(() => {
    const savedPage = localStorage.getItem('pagination_page')
    const savedLimit = localStorage.getItem('pagination_limit')
    if (savedPage) setPage(Number(savedPage))
    if (savedLimit) setRowsPerPage(Number(savedLimit))
  }, [])

  useEffect(() => {
    localStorage.setItem('pagination_page', String(page))
    localStorage.setItem('pagination_limit', String(rowsPerPage))
  }, [page, rowsPerPage])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const filteredTournees = tournees
    .filter((t) =>
      `${t.nom} ${t.type} ${sites[t.site_id] || t.adresse || ''} ${t.hr_depart_prevu ?? ''} ${t.hr_arrivee_prevu ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField] || ''
      const valB = b[sortField] || ''
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })

  const tourneesAffichees = filteredTournees.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestion des tournées</h1>
          
      <Dialog open={formVisible} onOpenChange={(open) => {setFormVisible(open) 
        if (!open) setSelected(null)  }}>

       <DialogContent className="w-full !max-w-5xl">

    <DialogHeader>
      <DialogTitle>{selected ? 'Modifier une tournée' : 'Créer une tournée'}</DialogTitle>
    </DialogHeader>
    <FormulaireTournee
      tournee={selected}
      conducteurs={conducteurs}
      onSuccess={() => {
        setFormVisible(false)
        chargerTournees()
        setSelected(null)
      }}
      onCancel={() => {
        setFormVisible(false)
        setSelected(null)
      }}
    />
  </DialogContent>

      </Dialog>

      <Dialog open={pointsModal} onOpenChange={(open) => setPointsModal(open)}>
        <DialogContent className="w-full !max-w-5xl">
          <DialogHeader>
            <DialogTitle>Points d'arrêt</DialogTitle>
          </DialogHeader>
          {selected && <ListePointsArret tourneeId={selected.id} />}
        </DialogContent>
      </Dialog>

      <Dialog open={employesModal} onOpenChange={(open) => setEmployesModal(open)}>
        <DialogContent className="w-full !max-w-5xl">
          <DialogHeader>
            <DialogTitle>Employés affectés</DialogTitle>
          </DialogHeader>
          {selected && (
            <ListeEmployesAffectesTournee
              tourneeId={selected.id}
              onClose={() => setEmployesModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal déclaration d'absences */}
<Dialog open={absencesModal} onOpenChange={(open) => setAbsencesModal(open)}>
  <DialogContent className="w-full !max-w-5xl">
    <DialogHeader>
      <DialogTitle>Déclarer des absences</DialogTitle>
    </DialogHeader>
    <AbsencesManager
      defaultDateDebut={absDateDebut}
      defaultDateFin={absDateFin}
      onClose={() => setAbsencesModal(false)}
    />
  </DialogContent>
</Dialog>

<Dialog open={absListModal} onOpenChange={(open) => setAbsListModal(open)}>
  <DialogContent className="w-full !max-w-5xl">
    <DialogHeader>
      <DialogTitle>Gérer les absences</DialogTitle>
    </DialogHeader>

    <AbsencesList onClose={() => setAbsListModal(false)} />
  </DialogContent>
</Dialog>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom, type, adresse, heure..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-neutral rounded shadow-sm w-full max-w-md focus:outline-none focus:ring focus:border-primary"
        />
        <button
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-semibold transition"
          onClick={() => {
            setFormVisible(true)
            setSelected(null)
          }}
        >
          + Nouvelle tournée
        </button>
        <button
  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-semibold transition"
  onClick={() => {
    // Si tu veux caler sur une tournée sélectionnée, setAbsDateDebut/Fin ici
    setAbsDateDebut(dayjs().format('YYYY-MM-DD'))
    setAbsDateFin(dayjs().format('YYYY-MM-DD'))
    setAbsencesModal(true)
  }}
>
  Déclarer des absences
</button>

 <button
  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-semibold transition"
  onClick={() => setAbsListModal(true)}
>
  Gérer les absences
</button>

      </div>

      {loading && <p className="text-gray-700">Chargement des tournées...</p>}
      {error && <p className="text-red-600 font-medium">Erreur : {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-secondary text-left font-semibold text-gray-700">
                {['nom', 'type', 'adresse', 'hr_depart_prevu', 'hr_arrivee_prevu', 'statut'].map((field) => (
                  <th
                    key={field}
                    className="px-4 py-2 cursor-pointer select-none"
                    onClick={() => handleSort(field)}
                  >
                    {field.replace(/_/g, ' ')} {sortField === field && (sortAsc ? '▲' : '▼')}
                  </th>
                ))}
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tourneesAffichees.map((t) => (
                <tr
                  key={t.id}
                  className={`border-t hover:bg-secondary/80 cursor-pointer ${selected?.id === t.id ? 'bg-accent/10' : ''}`}
                >
                  <td className="px-4 py-2">{t.nom}</td>
                  <td className="px-4 py-2">{t.type}</td>
                  <td className="px-4 py-2">{sites[t.site_id] || t.adresse || '—'}</td>
                  <td className="px-4 py-2">{t.hr_depart_prevu || '—'}</td>
                  <td className="px-4 py-2">{t.hr_arrivee_prevu || '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.statut ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.statut ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        setSelected(t)
                        setFormVisible(true)
                      }}
                      title="Modifier"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async (e: React.MouseEvent) => {
                        e.stopPropagation()
                        const confirm = window.confirm('Supprimer cette tournée ?')
                        if (!confirm) return
                        try {
                          await deleteTournee(t.id)
                          toast.success('Tournée supprimée.')
                          chargerTournees()
                        } catch (err: any) {
                          toast.error(err.message || 'Erreur lors de la suppression')
                        }
                      }}
                      title="Supprimer"
                    >
                      <Trash className="w-5 h-5 text-red-600" />
                    </Button>
                    {t.type === 'fixe' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          setSelected(t)
                          setPointsModal(true)
                        }}
                        title="Voir points d'arrêt"
                      >
                        <MapPin className="w-5 h-5 text-green-600" />
                      </Button>
                    )}
                    {t.type === 'flexible' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          setSelected(t)
                          setEmployesModal(true)
                        }}
                        title="Voir employés"
                      >
                        <Users className="w-5 h-5 text-orange-600" />
                      </Button>
                    )}
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
                onClick={() =>
                  setPage((p) =>
                    p * rowsPerPage < filteredTournees.length ? p + 1 : p
                  )
                }
                disabled={page * rowsPerPage >= filteredTournees.length}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 p-2">Total : {filteredTournees.length} tournée(s)</p>
        </div>
      )}
    </div>
  )
}

export default Tournees
