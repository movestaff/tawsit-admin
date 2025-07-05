import React from 'react'
import { Button } from './ui/button'

const TestConsole: React.FC = () => {
  console.log('✅ TestConsole monté.')

  const handleClick = () => {
    console.log('🧪 Bouton cliqué !')
    alert('Le bouton a été cliqué et la console a été loggée.')
  }

  return (
    <div className="p-4 border rounded bg-white shadow-md mt-6">
      <h2 className="text-lg font-semibold mb-2">Test Console</h2>
      <p className="mb-4">Clique sur le bouton ci-dessous pour vérifier que les fonctions sont bien déclenchées :</p>
      <Button onClick={handleClick}>Clique ici</Button>
    </div>
  )
}

export default TestConsole
