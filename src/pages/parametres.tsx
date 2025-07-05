import React, { useState } from 'react'
import Employes from '../pages/Employes'
import Conducteurs from '../pages/Conducteurs'
import Sites from './sites'
import GroupeEmployes from './GroupeEmployes'
import Vehicules from './Vehicules'
import Prestataires from './Prestataires'

// import Arrets from '../components/Arrets'

const onglets = [
  { label: 'Employés', value: 'employes' },
  { label: 'Conducteurs', value: 'conducteurs' },
  { label: 'Sites', value: 'sites' },
  { label: 'Groupes de travail', value: 'GroupeEmployes' },
  { label: 'Vehicules', value: 'Vehicules' },
  { label: 'Prestataires', value: 'Prestataires' }

]

function Parametres() {
  const [actif, setActif] = useState('employes')

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6 tracking-tight">Paramètres</h1>

      <div className="flex space-x-4 border-b border-gray-300 mb-4">
        {onglets.map((onglet) => (
          <button
            key={onglet.value}
            onClick={() => setActif(onglet.value)}
            className={`px-4 py-2 font-semibold border-b-2 ${
              actif === onglet.value
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-primary'
            }`}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      {/* Composants dynamiques selon l’onglet */}
      {actif === 'employes' && <Employes />}
      {actif === 'conducteurs' && <Conducteurs />}
      {actif === 'sites' && <Sites />}
      {actif === 'GroupeEmployes' && <GroupeEmployes />}
      {actif === 'Vehicules' && <Vehicules />}
      {actif === 'Prestataires' && <Prestataires />}
      {/* {actif === 'arrets' && <Arrets />} */}
    </div>
  )
}

export default Parametres
