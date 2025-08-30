import { useState } from 'react'
import Planification from './Planification'
import Calendrier from './Calendrier'
import AutoPlanificationAssistant from '../pages/Autoplan/AutoPlanificationAssistant'

const onglets = [
  { label: 'Planification', value: 'planification' },
  { label: 'Calendrier', value: 'calendrier' },
  { label: 'Assistant AutoPlan IA', value: 'autoplan' },
]

export default function PlanificationCalendrier() {
  const [actif, setActif] = useState<'planification' | 'calendrier' | 'autoplan'>('planification')

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6 tracking-tight">
        Gestion des planifications
      </h1>

      {/* Onglets */}
      <div className="flex space-x-4 border-b border-gray-300 mb-6">
        {onglets.map((onglet) => (
          <button
            key={onglet.value}
            onClick={() => setActif(onglet.value as typeof actif)}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              actif === onglet.value
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-primary'
            }`}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      {/* Affichage conditionnel */}
      {actif === 'planification' && <Planification />}
      {actif === 'calendrier' && <Calendrier />}
      {actif === 'autoplan' && <AutoPlanificationAssistant />}
    </div>
  )
}
