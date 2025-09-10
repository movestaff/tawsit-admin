import { useState } from 'react'
import PasswordManagementModal from '../components/PasswordManagementModal'

export default function ParametresSysteme() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Paramètres système</h1>
        <p className="text-sm text-gray-600">
          Configuration et outils d’administration du système.
        </p>
      </header>

      <section className="space-y-3">
        {/* Lien hypertexte vert forêt */}
        <button
          type="button"
          onClick={() => setPasswordModalOpen(true)}
          className="text-green-800 hover:text-green-900 underline"
        >
          Gestion des mots de passe utilisateurs
        </button>

        {/* Ajoute ici d’autres liens de paramétrage au besoin */}
        {/* <button className="text-green-800 hover:text-green-900 underline">Autre paramètre…</button> */}
      </section>

      {/* Modale de gestion des mots de passe */}
      <PasswordManagementModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  )
}
