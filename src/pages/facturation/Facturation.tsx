import React, { useState } from 'react'
import PeriodesPage from './PeriodesPage'
import MontantsPage from './MontantsPage'
import PaiementsPage from './PaiementsPage'
import type { Periode } from '../../types/facturation'

const onglets = [
  { label: 'Périodes', value: 'periodes' },
  { label: 'Montants', value: 'montants' },
  { label: 'Paiements', value: 'paiements' },
]

export default function Facturation() {
  const [actif, setActif] = useState<string>('periodes')
  const [periodeActive, setPeriodeActive] = useState<Periode | null>(null)

  const handleVoirMontants = (periode: Periode) => {
    setPeriodeActive(periode)
    setActif('montants')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary tracking-tight">
        Gestion de la facturation
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
        {actif === 'periodes' && (
          <PeriodesPage onVoirMontants={handleVoirMontants} />
        )}

        {actif === 'montants' && (
          <>
            {periodeActive ? (
              <MontantsPage periodeId={periodeActive.id} />
            ) : (
              <p className="text-red-600">
                ⚠️ Veuillez d'abord sélectionner une période depuis l’onglet Périodes.
              </p>
            )}
          </>
        )}

        {actif === 'paiements' && <PaiementsPage />}
      </div>
    </div>
  )
}
