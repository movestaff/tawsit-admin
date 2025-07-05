import React, { useEffect, useState } from 'react'
import { Pencil, Trash, List } from 'lucide-react'
import { fetchSites, deleteSite } from '../lib/api'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import ModalEditionSite from '../components/ModalEditionSite'
import ModalTourneesLieesAuSite from '../components/ModalTourneesLieesAuSite'
import { toast } from 'react-toastify'

function Sites() {
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [modalEdit, setModalEdit] = useState(false)
  const [modalTournees, setModalTournees] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const chargerSites = async () => {
    setLoading(true)
    try {
      const data = await fetchSites()
      setSites(data)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerSites()
  }, [])

  const filteredSites = sites.filter((s) =>
    `${s.nom} ${s.adresse}`.toLowerCase().includes(search.toLowerCase())
  )

  const sitesAffiches = filteredSites.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestion des sites</h1>

      <Dialog open={modalEdit} onOpenChange={(open) => {
        setModalEdit(open)
        if (!open) setSelected(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected ? 'Modifier le site' : 'Créer un site'}</DialogTitle>
          </DialogHeader>
          <ModalEditionSite
            site={selected}
            onSuccess={() => {
              setModalEdit(false)
              chargerSites()
              setSelected(null)
            }}
            onCancel={() => {
              setModalEdit(false)
              setSelected(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modalTournees} onOpenChange={(open) => setModalTournees(open)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tournées liées au site</DialogTitle>
          </DialogHeader>
          {selected && <ModalTourneesLieesAuSite site={selected} />}
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom ou adresse"
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
          + Nouveau site
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto rounded border border-neutral bg-white shadow-card">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-secondary text-left font-semibold text-gray-700">
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Adresse</th>
                <th className="px-4 py-2">Latitude</th>
                <th className="px-4 py-2">Longitude</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sitesAffiches.map((site) => (
                <tr key={site.id} className="border-t hover:bg-secondary/80">
                  <td className="px-4 py-2">{site.nom}</td>
                  <td className="px-4 py-2">{site.adresse}</td>
                  <td className="px-4 py-2">{site.latitude}</td>
                  <td className="px-4 py-2">{site.longitude}</td>
                  <td className="px-4 py-2 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(site); setModalEdit(true) }}>
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(site); setModalTournees(true) }}>
                      <List className="w-5 h-5 text-purple-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      if (confirm('Supprimer ce site ?')) {
                        try {
                          await deleteSite(site.id)
                          toast.success('Site supprimé.')
                          chargerSites()
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
                onClick={() => setPage((p) => p * rowsPerPage < filteredSites.length ? p + 1 : p)}
                disabled={page * rowsPerPage >= filteredSites.length}
                className="text-sm px-2 py-1 border rounded disabled:opacity-50"
              >
                Suivant ▶
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 p-2">Total : {filteredSites.length} site(s)</p>
        </div>
      )}
    </div>
  )
}

export default Sites
