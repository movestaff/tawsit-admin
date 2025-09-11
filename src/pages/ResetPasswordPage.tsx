// src/pages/ResetPasswordPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// ⬇️ adapte l'import à ton projet si besoin
import { supabase } from '../lib/supabaseClient' 

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const validate = () => {
    if (pwd.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères'
    if (!/[A-Z]/.test(pwd)) return 'Inclure au moins une majuscule (A-Z)'
    if (!/[a-z]/.test(pwd)) return 'Inclure au moins une minuscule (a-z)'
    if (!/[0-9]/.test(pwd)) return 'Inclure au moins un chiffre (0-9)'
    if (pwd !== pwd2) return 'Les deux mots de passe ne correspondent pas'
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) { setError(v); return }

    setLoading(true)
    try {
      // 1) Mettre à jour le mot de passe
      const { error: updErr } = await supabase.auth.updateUser({ password: pwd })
      if (updErr) throw updErr

      // 2) Lever le flag must_change_password (stocké en user_metadata)
      const { error: metaErr } = await supabase.auth.updateUser({ 
        data: { must_change_password: false } 
      })
      if (metaErr) {
        // non bloquant pour l’utilisateur, mais on le signale
        console.warn('Unable to clear must_change_password flag:', metaErr.message)
      }

      setOk(true)
      // 3) Rediriger proprement
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Définir un nouveau mot de passe</h1>
        <p className="text-sm text-gray-600">
          Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe avant d’accéder à l’application.
        </p>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full border rounded-xl p-2"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full border rounded-xl p-2"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {ok && <div className="text-sm text-green-600">Mot de passe mis à jour ✅ redirection…</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-2 font-medium bg-[#228B22] text-white hover:bg-[#1e7a1e] disabled:opacity-60"
          >
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>

        <div className="text-xs text-gray-500">
          Astuce sécurité : au moins 8 caractères, une majuscule, une minuscule et un chiffre.
        </div>
      </div>
    </div>
  )
}
