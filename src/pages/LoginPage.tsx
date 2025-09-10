// ✅ LoginPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { loginWeb } from '../lib/api'
import logo from '../assets/logo2.png'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login, setSocieteId } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    // 1️⃣ Authentification frontend → crée la session côté navigateur
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) throw new Error(error?.message || "Connexion Supabase échouée")

    const access_token = data.session.access_token

    // 2️⃣ Appel backend pour récupérer sociétés + groupe
     const { user, societes_autorisees, societe_par_defaut, groupe_id, must_change_password } = await loginWeb(email, password) 

    console.log('🟢 Connexion OK :', access_token, user)

    login(access_token, user)
    console.log('🔐 AuthStore mis à jour')

    localStorage.setItem('groupe_id', groupe_id)
    localStorage.setItem('societes', JSON.stringify(societes_autorisees || []))

    // ⬇️ AJOUT : redirection obligatoire si le backend a posé le flag
if (must_change_password === true) {
  
  localStorage.setItem('must_change_password', 'true')
  navigate('/reset-password')
  return; // on stoppe le flow normal (pas de sélection de société)
}

    if (societes_autorisees?.length === 1) {
      setSocieteId(societe_par_defaut)
      navigate('/dashboard')
    } else {
      navigate('/select-societe')
    }

  } catch (err: any) {
    console.error('Erreur login', err)
    setError(err.message || 'Erreur de connexion')
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="bg-[#F4F4F4] p-8 rounded-lg shadow-lg w-full max-w-md">
        <img src={logo} alt="Logo Tawsit" className="mx-auto mb-12 h-48" />
        <h2 className="text-center text-2xl font-bold text-[#228B22] mb-6">Connexion Tawsit</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="email">Adresse e-mail</Label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-green-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="password">Mot de passe</Label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-green-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  )
}
