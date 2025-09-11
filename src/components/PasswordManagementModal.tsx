import { useEffect, useState } from 'react'
import {
  adminGenerateRecoveryLink,
  adminResetPasswordDirect,
  getUsersBySociete,
  getUsersDistincts,
  type UserListItem,
  type UserListFilters,
  type UserListResponse,
} from '../lib/api'
import { toast } from 'react-toastify'

// ✅ Tawsit: utilisation du composant Button
import { Button } from '../components/ui/button'

/** Petit hook de debounce générique (inchangé) */
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

type Props = {
  open: boolean
  onClose: () => void
}

export default function PasswordManagementModal({ open, onClose }: Props) {
  // Pagination & tri (logique inchangée – UI tri supprimée)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState<UserListFilters['sort_by']>('created_at')
  const [sortDir, setSortDir] = useState<UserListFilters['sort_dir']>('desc')

  // Filtres multi-critères
  const [q, setQ] = useState('')
  const [role, setRole] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')

  // Debounced values
  const dq = useDebounced(q)
  const dEmail = useDebounced(email)
  const dUsername = useDebounced(username)
  const dDisplayName = useDebounced(displayName)

  // Données
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)

  // Rôles pour la <select>
  const [roles, setRoles] = useState<string[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Sélection + actions
  const [selected, setSelected] = useState<UserListItem | null>(null)
  const [newPwd, setNewPwd] = useState('')
  const [reason, setReason] = useState('')
  const [busyAction, setBusyAction] = useState<'reset' | 'link' | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)))
  const hasMore = page < totalPages

  /** Charger la liste (societe_id injecté côté backend) */
  useEffect(() => {
    if (!open) return

    ;(async () => {
      try {
        setLoading(true)

        const filters: UserListFilters = {
          page,
          limit,
          q: dq || undefined,
          role: role || undefined,
          email: dEmail || undefined,
          username: dUsername || undefined,
          display_name: dDisplayName || undefined,
          sort_by: sortBy,
          sort_dir: sortDir,
        }

        const resp: UserListResponse = await getUsersBySociete(filters)
        setItems(resp.items)
        setTotal(resp.total)
      } catch (e: any) {
        toast.error(e?.message || 'Erreur de chargement des utilisateurs')
      } finally {
        setLoading(false)
      }
    })()
  }, [open, page, limit, dq, role, dEmail, dUsername, dDisplayName, sortBy, sortDir])

  /** Charger la liste de rôles dans la société courante */
  useEffect(() => {
    if (!open) return

    ;(async () => {
      try {
        setLoadingRoles(true)
        const { roles } = await getUsersDistincts()
        setRoles(roles || [])
      } catch (e: any) {
        toast.error(e?.message || 'Erreur lors du chargement des rôles')
      } finally {
        setLoadingRoles(false)
      }
    })()
  }, [open])

  /** Reset état lorsqu’on ouvre la modale */
  useEffect(() => {
    if (open) {
      setPage(1)
      setSelected(null)
      setNewPwd('')
      setReason('')
      setGeneratedLink(null)
    }
  }, [open])

  if (!open) return null

  const onResetDirect = async () => {
    if (!selected?.id) return toast.warn('Sélectionne un utilisateur')
    if (!newPwd || newPwd.length < 8) return toast.warn('Mot de passe trop court (min. 8 caractères)')
    try {
      setBusyAction('reset')
      const r = await adminResetPasswordDirect(selected.id, newPwd, reason || undefined)
      if ('ok' in r && r.ok) {
        toast.success('Mot de passe réinitialisé (l’utilisateur devra le changer à la prochaine connexion)')
        setNewPwd('')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Échec du reset')
    } finally {
      setBusyAction(null)
    }
  }

  const onGenerateLink = async () => {
    if (!selected?.id) return toast.warn('Sélectionne un utilisateur')
    try {
      setBusyAction('link')
      const r = await adminGenerateRecoveryLink(
        selected.id,
         window.location.origin,
        reason || undefined
      )
      if ('ok' in r && r.ok) {
        setGeneratedLink(r.action_link || null)
        toast.success('Lien de recovery généré')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Échec de la génération du lien')
    } finally {
      setBusyAction(null)
    }
  }

  // ✅ Styles Tawsit centralisés
  const inputBase =
    'border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600'
  const selectBase = inputBase
  const cardBase = 'border rounded-2xl shadow-sm bg-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-lg border border-gray-200">
        {/* Header Tawsit */}
        <div className="flex items-center justify-between px-6 py-4 border-b rounded-t-2xl">
          <h2 className="text-lg font-semibold">Gestion des mots de passe</h2>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Filtres (sans 'Trier par') */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            className={`${inputBase} md:col-span-2`}
            placeholder="Recherche globale (email, username, nom)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <input
            className={inputBase}
            placeholder="Email contient…"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputBase}
            placeholder="Username contient…"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className={inputBase}
            placeholder="Nom à afficher contient…"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <select
            className={selectBase}
            value={role || ''}
            onChange={(e) => setRole(e.target.value || undefined)}
          >
            <option value="">{loadingRoles ? 'Chargement…' : 'Tous rôles'}</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Liste + panneau d’action */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Liste */}
          <div className={`${cardBase} lg:col-span-2 overflow-hidden`}>
            <div className="max-h-[48vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="text-left">
                    <th className="p-3">Nom affiché</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Rôle</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="p-4 text-center" colSpan={5}>Chargement…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td className="p-4 text-center" colSpan={5}>Aucun utilisateur</td></tr>
                  ) : items.map((u, idx) => (
  <tr
    key={u.id}
    onClick={() => setSelected(u)}
    className={`cursor-pointer transition-colors 
      ${idx % 2 ? 'bg-white' : 'bg-gray-50/60'} 
      hover:bg-green-100 
      ${selected?.id === u.id ? 'bg-green-200 font-medium' : ''}`}
  >
    <td className="p-3">{u.display_name || '—'}</td>
    <td className="p-3">{u.email || '—'}</td>
    <td className="p-3">{u.username || '—'}</td>
    <td className="p-3">{u.role || '—'}</td>
  </tr>
))}
                </tbody>
              </table>
            </div>

            {/* Footer : pagination gauche / limit à droite */}
            <div className="flex items-center justify-between p-3 border-t text-sm bg-white rounded-b-2xl">
              {/* ⬅️ Précédent / Suivant à gauche */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ◀ Précédent
                </Button>
                <div className="px-2 py-1">Page {page} / {totalPages}</div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant ▶
                </Button>
              </div>

              {/* ➡️ Lignes par page à droite */}
              <div className="flex items-center gap-2">
                <span>{total} utilisateur(s)</span>
                <label className="text-sm">Lignes par page :</label>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  value={limit}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    setLimit(Number.isFinite(v) ? v : 10)
                    setPage(1)
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Panneau d’action */}
          <div className={`${cardBase} p-4 flex flex-col gap-3`}>
            <div className="font-medium">Utilisateur sélectionné</div>
            {selected ? (
              <div className="rounded-xl border p-3 text-sm bg-gray-50">
                <div><span className="text-gray-500">Nom :</span> {selected.display_name || '—'}</div>
                <div><span className="text-gray-500">Email :</span> {selected.email || '—'}</div>
                <div><span className="text-gray-500">Username :</span> {selected.username || '—'}</div>
                <div><span className="text-gray-500">Rôle :</span> {selected.role || '—'}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Aucun utilisateur sélectionné</div>
            )}

            <label className="text-sm font-medium mt-2">Raison (journalisation)</label>
            <input
              className={inputBase}
              placeholder="Optionnel"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {/* Reset direct */}
            <div className="mt-2 space-y-2">
              <div className="text-sm font-medium">Reset direct</div>
              <input
                className={inputBase}
                type="password"
                placeholder="Nouveau mot de passe (min. 8)"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
              <Button
                variant="primary"
                size="md"
                disabled={!selected || busyAction === 'reset'}
                onClick={onResetDirect}
              >
                {busyAction === 'reset' ? 'Réinitialisation…' : 'Réinitialiser (direct)'}
              </Button>
            </div>

            {/* Lien de recovery */}
            <div className="mt-2 space-y-2">
              <div className="text-sm font-medium">Générer lien de recovery</div>
              <Button
                variant="outline"
                size="md"
                disabled={!selected || busyAction === 'link'}
                onClick={onGenerateLink}
              >
                {busyAction === 'link' ? 'Génération…' : 'Générer le lien'}
              </Button>

              {generatedLink && (
                <div className="text-xs bg-gray-50 border rounded-xl p-2 break-all">
                  <div className="mb-1 font-medium">Lien généré :</div>
                  <div className="mb-2">{generatedLink}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink)
                      toast.info('Lien copié')
                    }}
                  >
                    Copier
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-auto flex justify-end">
              <Button variant="outline" onClick={onClose}>Fermer</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
