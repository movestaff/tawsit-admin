import { useState } from 'react'
import Tournees from './Tournees'
import ListeExecutionsTournees from './ListeExecutionsTournees'

const onglets = [
  { label: 'Tournées', value: 'tournees' },
  { label: 'Exécutions', value: 'executions' },
]

export default function GestionTournee() {
  const [actif, setActif] = useState<string>('tournees')

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary tracking-tight">
        Gestion des tournées
      </h1>

      <div className="flex space-x-4 border-b border-gray-300">
        {onglets.map((onglet) => (
          <button
            key={onglet.value}
            onClick={() => setActif(onglet.value)}
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

      <div>
        {actif === 'tournees' && <Tournees />}
        {actif === 'executions' && <ListeExecutionsTournees />}
      </div>
    </div>
  )
}
