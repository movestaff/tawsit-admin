import React, { useEffect, useState } from 'react'
import ListePlanifications from '../components/ListePlanifications'
import ModalPlanification from '../components/ModalPlanification'
import { Button } from '../components/ui/button'
import { fetchPlanifications, fetchTournees } from '../lib/api'

const Planification: React.FC = () => {
  const [planifications, setPlanifications] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [tournees, setTournees] = useState<any[]>([])
  const [planificationActive, setPlanificationActive] = useState<any | null>(null)

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    const data = await fetchPlanifications()
    console.log('📦 planifs reçues:', data)
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📅 Gestion des planifications</h1>
        <Button onClick={handleAjouter} className="bg-green-700 text-white">
          + Nouvelle planification
        </Button>
      </div>

      <ListePlanifications
        planifications={planifications}
        onEdit={handleModifier}
        onRefresh={chargerDonnees}
      />

      <ModalPlanification
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRefresh={chargerDonnees}
        planification={planificationActive}
        tournees={tournees}
      />
    </div>
  )
}

export default Planification
