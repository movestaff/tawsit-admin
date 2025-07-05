import React, { useEffect, useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { ajouterConducteur, updateConducteur, deleteConducteur } from '../lib/api'
import { toast } from 'react-toastify'
import AffectationsConducteur from '../components/AffectationsConducteur'
import AffectationFormConducteur from '../components/AffectationFormConducteur'
import VehiculesAffectes from '../components/VehiculesAffectes'
import AffectationVehiculeForm from '../components/AffectationVehiculeForm'
import PhotoUploaderConducteur from './PhotoUploaderConducteur'
import { fetchPhotoConducteurAsBlob } from '../lib/api'
import { fetchPrestataires } from '../lib/api' 



interface Props {
  conducteur?: any
  onSuccess: () => void
  onCancel?: () => void
}

const FormulaireConducteur: React.FC<Props> = ({ conducteur, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    numero_permis: '',
    date_delivrance: '',
    date_expiration: '',
    photo: '',
    numero_piece_identite: '',
    email: '',
    numero_telephone: '',
    adresse: '',
    ville: '',
    pays: '',
    permis_url: '',
    piece_identite_url: '',
    prestataire_id: '',
    statut: 'pending'
  })

  const [showAffectationTournee, setShowAffectationTournee] = useState(false)
  const [refreshAffectationsTournee, setRefreshAffectationsTournee] = useState(false)
  const [showAffectationVehicule, setShowAffectationVehicule] = useState(false)
  const [refreshAffectationsVehicule, setRefreshAffectationsVehicule] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prestataires, setPrestataires] = useState<any[]>([])
  const [isNumeroPermisFocused, setIsNumeroPermisFocused] = useState(false)
  const [focusStates, setFocusStates] = useState<Record<string, boolean>>({});
  const handleFocus = (field: string) => {
  setFocusStates((prev) => ({ ...prev, [field]: true }));
};

const handleBlur = (field: string) => {
  setFocusStates((prev) => ({ ...prev, [field]: false }));
};



  useEffect(() => {
    if (conducteur) {
      setForm({
        nom: conducteur.nom || '',
        prenom: conducteur.prenom || '',
        numero_permis: conducteur.numero_permis || '',
        date_delivrance: conducteur.date_delivrance ? conducteur.date_delivrance.slice(0, 10) : '',
        date_expiration: conducteur.date_expiration ? conducteur.date_expiration.slice(0, 10) : '',
        photo: conducteur.photo || '',
        numero_piece_identite: conducteur.numero_piece_identite || '',
        email: conducteur.email || '',
        numero_telephone: conducteur.numero_telephone || '',
        adresse: conducteur.adresse || '',
        ville: conducteur.ville || '',
        pays: conducteur.pays || '',
        permis_url: conducteur.permis_url || '',
        piece_identite_url: conducteur.piece_identite_url || '',
        prestataire_id: conducteur.prestataire_id || '',
        statut: conducteur.statut || 'pending'
      })
    }
  }, [conducteur])

  useEffect(() => {
  const chargerPrestataires = async () => {
    try {
      const data = await fetchPrestataires()
      setPrestataires(data)
    } catch (e) {
      console.error('Erreur chargement prestataires', e)
    }
  }
  chargerPrestataires()
}, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
      }

  const handleSubmit = async () => {
  if (isSubmitting) {
    console.warn("⏳ Soumission déjà en cours... double appel ignoré.");
    return;
  }

  setIsSubmitting(true);

  try {
    if (!form.nom || !form.numero_permis || !form.email) {
      toast.error('Les champs nom, numéro de permis et email sont obligatoires.');
      return;
    }

    // ---- Création ----
    if (!conducteur) {
      // 1. Création du conducteur sans compte Supabase Auth (statut pending)
      console.log("🚀 Payload envoyé à /conducteurs :", {
        ...form,
        email: form.email?.trim() || null
      });

      await ajouterConducteur({
        ...form,
        email: form.email?.trim() || null,
        // ⚠️ Ne pas transmettre d'ID ici — il sera généré côté DB
      });

      toast.success('Conducteur enregistré en attente de validation.');
      onSuccess();
      return;
    }

    // ---- Modification ----
    await updateConducteur(conducteur.id, {
      ...form,
      email: form.email?.trim() || null,
    });

    toast.success('Conducteur mis à jour.');
    onSuccess();

  } catch (e: any) {
    console.error("❌ Erreur handleSubmit:", e);
    toast.error(e.message || "Erreur inattendue lors de l’enregistrement.");
  } finally {
    setIsSubmitting(false);
  }
};



  const handleDelete = async () => {
    if (!conducteur) return
    const confirm = window.confirm('Supprimer ce conducteur ? Cette action est irréversible.')
    if (!confirm) return

    try {
      await deleteConducteur(conducteur.id)
      toast.success('Conducteur supprimé.')
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Suppression impossible.')
    }
  }

const [photoUrl, setPhotoUrl] = useState<string | null>(null)
useEffect(() => {
  console.log('👤 Conducteur ID:', conducteur?.ID)
  console.log('🖼️ FORM.PHOTO:', form.photo)

  if (conducteur?.id && form.photo) {
    fetchPhotoConducteurAsBlob(conducteur.id)
      .then((url) => {
        console.log('🔗 URL BLOP:', url)
        setPhotoUrl(url)
      })
      .catch((err) => {
        console.error('Erreur chargement image:', err)
        setPhotoUrl(null)
      })
  }
}, [conducteur?.id, form.photo])


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      {/* ------ Colonne gauche : formulaire ------ */}
      <form className="md:col-span-2 space-y-4 bg-white border rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {conducteur ? `Modifier le conducteur : ${conducteur.nom}` : 'Ajouter un nouveau conducteur'}
        </h2>

        {/* Photo/avatar à gauche + nom/prénom horizontal */}
        <div className="flex items-center gap-6 mb-6">
          {/* Avatar/photo à gauche */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <img
              src={
                photoUrl || 
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(form.prenom || '')}+${encodeURIComponent(form.nom || '')}&background=228B22&color=fff&size=128`
              }
              alt="Photo ou avatar du conducteur"
              className="w-32 h-32 rounded-full object-cover border-2 border-primary shadow mb-2"
              style={{ minWidth: 96, minHeight: 96 }}
            />
            {conducteur?.id && (
              <PhotoUploaderConducteur
                conducteurId={conducteur.id}
                photoUrl={form.photo}
                onPhotoUploaded={(url) => setForm(prev => ({ ...prev, photo: url }))}
              />
            )}
          </div>
          {/* Nom et prénom à droite, alignés horizontalement */}
          <div className="flex gap-4 items-center w-full">
            <Input
              id="nom"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Nom"
              className="font-bold text-lg"
            />
            <Input
              id="prenom"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              placeholder="Prénom"
              className="font-bold text-lg"
            />
          </div>
        </div>

        {/* Les autres champs, tous avec placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {[
    { id: 'numero_permis', label: 'N° Permis de conduire' },
    { id: 'date_delivrance', label: 'Date de délivrance', type: 'date' },
    { id: 'date_expiration', label: 'Date d\'expiration', type: 'date' },
    { id: 'numero_piece_identite', label: 'N° Pièce d\'identité' },
    { id: 'email', label: 'Email' },
    { id: 'numero_telephone', label: 'Téléphone' },
    { id: 'adresse', label: 'Adresse' },
    { id: 'ville', label: 'Ville' },
    { id: 'pays', label: 'Pays' },
  ].map(({ id, label, type }) => (
    <div className="relative" key={id}>
      <Input
        id={id}
        name={id}
        type={type || 'text'}
        value={form[id as keyof typeof form]}
        onChange={handleChange}
        onFocus={() => handleFocus(id)}
        onBlur={() => handleBlur(id)}
        className="border rounded px-3 py-3 w-full focus:outline-none focus:ring focus:border-primary"
      />
      <label
        htmlFor={id}
        className={`
          absolute left-3 px-1 bg-white text-gray-500 text-sm transition-all duration-200 pointer-events-none
          ${focusStates[id] || form[id as keyof typeof form]
            ? '-top-2 text-xs text-primary'
            : 'top-1/2 -translate-y-1/2'}
        `}
      >
        {label}
      </label>
    </div>
  ))}
</div>


        <div className="mt-4">
          <label htmlFor="prestataire_id" className="block text-sm font-medium text-gray-700 mb-1">
          Prestataire
        </label>
        <select
            id="prestataire_id"
            name="prestataire_id"
            value={form.prestataire_id}
            onChange={handleChange}
            className="border rounded w-full px-3 py-2 shadow-sm focus:outline-none focus:ring focus:border-primary"
               >
          <option value="">-- Sélectionner un prestataire --</option>
           {prestataires.map((p) => (
            <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>


        {/* Champs pour upload des pièces jointes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* <UploaderPermisConducteur ... /> */}
          {/* <UploaderPieceIdentiteConducteur ... /> */}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Statut</span>
            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              className="border rounded px-2 py-1"
            >
              <option value="actif">Actif</option>
             
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
          <div className="flex gap-3 ml-auto">
            {conducteur && (
              <Button type="button" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleDelete}>
                Supprimer
              </Button>
            )}
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Fermer la fiche
              </Button>
            )}
            <Button type="button" className="bg-primary text-white" onClick={handleSubmit}>
              {conducteur ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>

      {/* ------ Colonne droite : affectations ------ */}
      <div className="md:col-span-1 flex flex-col gap-8">
        {conducteur && (
          <>
            {/* Bloc Tournées */}
            <div className="bg-white border rounded shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Tournées affectées</h3>
                <Button
                  type='button'
                  variant="outline"
                  className="text-sm"
                  onClick={() => setShowAffectationTournee(!showAffectationTournee)}
                >
                  {showAffectationTournee ? 'Fermer le formulaire' : '➕ Affecter une tournée'}
                </Button>
              </div>
              <AffectationsConducteur
                conducteurId={conducteur.id}
                key={refreshAffectationsTournee.toString()}
              />
              {showAffectationTournee && (
                <div className="mt-4">
                  <AffectationFormConducteur
                    conducteurId={conducteur.id}
                    onAffectationComplete={() => {
                      setRefreshAffectationsTournee(prev => !prev)
                      setShowAffectationTournee(false)
                    }}
                  />
                </div>
              )}
            </div>
            {/* Bloc Véhicules */}
            <div className="bg-white border rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Véhicules affectés</h3>
                <Button
                  type='button'
                  variant="outline"
                  className="text-sm"
                  onClick={() => setShowAffectationVehicule(!showAffectationVehicule)}
                >
                  {showAffectationVehicule ? 'Fermer le formulaire' : '➕ Affecter un véhicule'}
                </Button>
              </div>
              <VehiculesAffectes
                conducteurId={conducteur.id}
                key={refreshAffectationsVehicule.toString()}
              />
              {showAffectationVehicule && (
                <div className="mt-4">
                  <AffectationVehiculeForm
                    conducteurId={conducteur.id}
                    onAffectationComplete={() => {
                      setRefreshAffectationsVehicule(prev => !prev)
                      setShowAffectationVehicule(false)
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FormulaireConducteur
