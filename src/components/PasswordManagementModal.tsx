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

/** Petit hook de debounce générique */
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
  // Pagination & tri
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
        `${window.location.origin}/auth/callback?next=/reset-password`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Gestion des mots de passe utilisateurs</h2>
          <button className="text-gray-500 hover:text-black" onClick={onClose}>✕</button>
        </div>

        {/* Filtres */}
        <div className="px-5 py-3 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            className="border rounded-xl p-2 md:col-span-2"
            placeholder="Recherche globale (email, username, nom)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <input
            className="border rounded-xl p-2"
            placeholder="Email contient…"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border rounded-xl p-2"
            placeholder="Username contient…"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border rounded-xl p-2"
            placeholder="Nom à afficher contient…"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <select
            className="border rounded-xl p-2"
            value={role || ''}
            onChange={(e) => setRole(e.target.value || undefined)}
          >
            <option value="">{loadingRoles ? 'Chargement…' : 'Tous rôles'}</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="flex gap-2 items-center md:col-span-2">
            <label className="text-sm">Trier par</label>
            <select
              className="border rounded-xl p-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as UserListFilters['sort_by'])}
            >
              <option value="created_at">Date création</option>
              <option value="email">Email</option>
              <option value="username">Username</option>
              <option value="display_name">Nom affiché</option>
              <option value="role">Rôle</option>
            </select>
            <select
              className="border rounded-xl p-2"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as UserListFilters['sort_dir'])}
            >
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>

            <select
              className="border rounded-xl p-2 ml-auto"
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

        {/* Liste + panneau d’action */}
        <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Liste */}
          <div className="lg:col-span-2 border rounded-xl overflow-hidden">
            <div className="max-h-[48vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Nom affiché</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Rôle</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="p-4 text-center" colSpan={5}>Chargement…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td className="p-4 text-center" colSpan={5}>Aucun utilisateur</td></tr>
                  ) : items.map((u) => (
                    <tr key={u.id} className={selected?.id === u.id ? 'bg-green-50' : ''}>
                      <td className="p-2">{u.display_name || '—'}</td>
                      <td className="p-2">{u.email || '—'}</td>
                      <td className="p-2">{u.username || '—'}</td>
                      <td className="p-2">{u.role || '—'}</td>
                      <td className="p-2">
                        <button
                          className="px-2 py-1 rounded-lg border hover:bg-gray-50"
                          onClick={() => setSelected(u)}
                        >
                          Sélectionner
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-3 border-t text-sm">
              <div>{total} utilisateur(s)</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded-lg border disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Précédent
                </button>
                <div className="px-2 py-1">Page {page} / {totalPages}</div>
                <button
                  className="px-3 py-1 rounded-lg border disabled:opacity-50"
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>

          {/* Panneau d’action */}
          <div className="border rounded-xl p-3 flex flex-col gap-3">
            <div className="font-medium">Utilisateur sélectionné</div>
            {selected ? (
              <div className="rounded-lg border p-3 text-sm">
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
              className="border rounded-xl p-2"
              placeholder="Optionnel"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="mt-2 space-y-2">
              <div className="text-sm font-medium">Reset direct</div>
              <input
                className="border rounded-xl p-2 w-full"
                type="password"
                placeholder="Nouveau mot de passe (min. 8)"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
              <button
                disabled={!selected || busyAction === 'reset'}
                onClick={onResetDirect}
                className="w-full rounded-xl py-2 border bg-black text-white disabled:opacity-50"
              >
                {busyAction === 'reset' ? 'Réinitialisation…' : 'Réinitialiser (direct)'}
              </button>
            </div>

            <div className="mt-2 space-y-2">
              <div className="text-sm font-medium">Générer lien de recovery</div>
              <button
                disabled={!selected || busyAction === 'link'}
                onClick={onGenerateLink}
                className="w-full rounded-xl py-2 border hover:bg-gray-50 disabled:opacity-50"
              >
                {busyAction === 'link' ? 'Génération…' : 'Générer le lien'}
              </button>
              {generatedLink && (
                <div className="text-xs bg-gray-50 border rounded-xl p-2 break-all">
                  <div className="mb-1 font-medium">Lien généré :</div>
                  <div className="mb-2">{generatedLink}</div>
                  <button
                    className="px-2 py-1 rounded-lg border hover:bg-white"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink)
                      toast.info('Lien copié')
                    }}
                  >
                    Copier
                  </button>
                </div>
              )}
            </div>

            <button onClick={onClose} className="mt-auto rounded-xl py-2 border hover:bg-gray-50">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
