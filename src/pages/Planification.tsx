import React, { useEffect, useState } from 'react'
import ListePlanifications from '../components/ListePlanifications'
import ModalPlanification from '../components/ModalPlanification'
import CalendrierPlanifications from '../components/CalendrierPlanifications'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { fetchPlanifications, fetchTournees, deletePlanification } from '../lib/api'
import { autoPlanTours } from '../lib/api'

const Planification: React.FC = () => {
  const [planifications, setPlanifications] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [tournees, setTournees] = useState<any[]>([])
  const [planificationActive, setPlanificationActive] = useState<any | null>(null)
  const [modeDuplication, setModeDuplication] = useState(false)
  const [filtreTexte, setFiltreTexte] = useState('')
  const [filtreType, setFiltreType] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [vue, setVue] = useState<'tableau' | 'calendrier'>('tableau')

const [loadingAuto, setLoadingAuto] = useState(false)
const [autoMessage, setAutoMessage] = useState('')

const handleAutoPlan = async () => {
  setLoadingAuto(true)
  setAutoMessage('')
  try {
    const result = await autoPlanTours({
      date: '2025-06-20', // ou une date dynamique
      recurrence: 'unique'
    })
    setAutoMessage(`✅ ${result.tours_count} tournée(s) générée(s).`)
    chargerDonnees()
  } catch (err: any) {
    setAutoMessage(`❌ ${err.message}`)
  } finally {
    setLoadingAuto(false)
  }
}


  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    const data = await fetchPlanifications()
    const tours = await fetchTournees()
    setPlanifications(data || [])
    setTournees(tours || [])
  }

  const handleAjouter = () => {
    setPlanificationActive(null)
    setModalOpen(true)
  }

  const handleModifier = (planification: any) => {
    setPlanificationActive(planification)
    setModalOpen(true)
  }

  const handleDupliquer = (planification: any) => {
    setPlanificationActive(planification)
    setModeDuplication(true)
    setModalOpen(true)
  }

  const handleSupprimer = async (planificationId: string) => {
    if (!confirm('Confirmer la suppression de cette planification ?')) return

    try {
      await deletePlanification(planificationId)
      alert('Planification supprimée avec succès.')
      chargerDonnees()
    } catch (err: any) {
      const message = err?.message?.includes('Impossible de supprimer')
        ? "❌ Cette planification ne peut pas être supprimée car elle a déjà été exécutée."
        : err.message || 'Erreur lors de la suppression.'
      alert(message)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6 tracking-tight"> Gestion des planifications</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="h-10">
            <Input
              placeholder="🔍 Rechercher..."
              value={filtreTexte}
              onChange={(e) => setFiltreTexte(e.target.value)}
              className="h-10 w-80 px-3 text-sm"
            />
          </div>
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            className="h-10 w-48 px-3 text-sm border rounded"
          >
            <option value="">🌀 Tous types</option>
            <option value="unique">📍 Unique</option>
            <option value="hebdomadaire">🔁 Hebdo</option>
            <option value="mensuelle">📅 Mensuel</option>
          </select>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="h-10 w-48 px-3 text-sm border rounded"
          >
            <option value="">⚪ Tous statuts</option>
            <option value="active">✅ Actives</option>
            <option value="inactive">⛔ Inactives</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
{autoMessage && <p className="mt-2 text-sm text-gray-600">{autoMessage}</p>}
          <Button
  onClick={handleAutoPlan}
  disabled={loadingAuto}
  className="bg-indigo-700 text-white h-10 px-4 text-sm"
>
  {loadingAuto ? 'Optimisation...' : '⚙️ Générer tournées auto'}
</Button>
          <Button
            variant={vue === 'tableau' ? 'primary' : 'outline'}
            onClick={() => setVue('tableau')}
            className="h-10 px-4 text-sm"
          >
            📋 Tableau
          </Button>
          <Button
            variant={vue === 'calendrier' ? 'primary' : 'outline'}
            onClick={() => setVue('calendrier')}
            className="h-10 px-4 text-sm"
          >
            📆 Calendrier
          </Button>
          <Button onClick={handleAjouter} className="bg-green-700 text-white h-10 px-4 text-sm">
            + Nouvelle planification
          </Button>
        </div>
      </div>

      {vue === 'tableau' && (
        <ListePlanifications
          planifications={planifications}
          onEdit={handleModifier}
          onDuplicate={handleDupliquer}
          onDelete={handleSupprimer}
          onRefresh={chargerDonnees}
          filtreTexte={filtreTexte}
          filtreType={filtreType}
          filtreStatut={filtreStatut}
        />
      )}

      {vue === 'calendrier' && (
        <CalendrierPlanifications
         planifications={planifications}
         filtreTexte={filtreTexte}
         filtreType={filtreType}
         filtreStatut={filtreStatut}
         
        
         />
      )}

      <ModalPlanification
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setModeDuplication(false)
          setPlanificationActive(null)
        }}
        onRefresh={chargerDonnees}
        planification={planificationActive}
        tournees={tournees}
        enDuplication={modeDuplication}
      />
    </div>
  )
}

export default Planification
