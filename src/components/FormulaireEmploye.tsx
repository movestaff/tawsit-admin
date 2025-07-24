import React, { useEffect, useState } from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { ajouterEmploye, updateEmploye, deleteEmploye, fetchPhotoEmployeAsBlob, geocodeAdresse } from '../lib/api'
import { toast } from 'react-toastify'
import AffectationsEmploye from './AffectationsEmploye'
import AffectationForm from './AffectationForm'
import PhotoUploader from './PhotoUploader'
import CartePointArret from './CartePointArret'
import { Dialog, DialogContent } from './ui/dialog'

interface Props {
  employe?: any
  onSuccess: () => void
  onCancel?: () => void
  readonly?: boolean;
}

const FormulaireEmploye: React.FC<Props> = ({ employe, onSuccess, onCancel, readonly }) => {
  const [form, setForm] = useState<{
    nom: string
    prenom: string
    matricule: string
    email: string
    telephone: string
    adresse: string
    ville: string
    pays: string
    service: string
    departement: string
    actif: boolean
    photo: string
    latitude: number | null
    longitude: number | null
  }>({
    nom: '',
    prenom: '',
    matricule: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: '',
    service: '',
    departement: '',
    actif: true,
    photo: '',
    latitude: null,
    longitude: null,
  })

  const [showAffectation, setShowAffectation] = useState(false)
  const [refreshAffectations, setRefreshAffectations] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [openMap, setOpenMap] = useState(false)
  const [focusStates, setFocusStates] = useState<Record<string, boolean>>({});

  const handleFocus = (field: string) => {
  setFocusStates((prev) => ({ ...prev, [field]: true }));
};

const handleBlur = (field: string) => {
  setFocusStates((prev) => ({ ...prev, [field]: false }));
};



  useEffect(() => {
    if (employe && (employe.ID || employe.id)) {
      setForm({
        nom: employe.nom || '',
        prenom: employe.prenom || '',
        matricule: employe.matricule || '',
        email: employe.email || '',
        telephone: employe.telephone || '',
        adresse: employe.adresse || '',
        ville: employe.ville || '',
        pays: employe.pays || '',
        service: employe.service || '',
        departement: employe.departement || '',
        actif: employe.actif ?? true,
        photo: employe.photo || '',
        latitude: employe.latitude,
        longitude: employe.longitude,
      })
    }
  }, [employe?.ID, employe?.id])

  useEffect(() => {
    if (employe?.ID && form.photo) {
      fetchPhotoEmployeAsBlob(employe.ID)
        .then((url) => setPhotoUrl(url))
        .catch(() => setPhotoUrl(null))
    }
  }, [employe?.ID, form.photo])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if ((name === 'adresse' || name === 'ville' || name === 'pays') && value.length > 3) {
      const fullAdresse = [name === 'adresse' ? value : form.adresse, name === 'ville' ? value : form.ville, name === 'pays' ? value : form.pays].filter(Boolean).join(', ')
      const result = await geocodeAdresse(fullAdresse)
      if (result) {
        setForm(prev => ({
          ...prev,
          latitude: result.lat,
          longitude: result.lng
        }))
      } else {
        toast.error("Adresse non reconnue. Veuillez vérifier.")
      }
    }
  }

  const handleSubmit = async () => {
    if (!form.nom || !form.matricule) {
      toast.error('Les champs nom et matricule sont obligatoires.')
      return
    }

    const payload = {
      ...form,
      email: form.email?.trim() || null,
    }

    try {
      if (employe) {
        await updateEmploye(employe.ID, payload)
        toast.success('Employé mis à jour.')
        onSuccess()
      } else {
        await ajouterEmploye(payload)
        toast.success('Employé ajouté avec succès !')
        onSuccess()
      }
    } catch (e: any) {
      if (e.message?.includes('employes_email_key')) {
        toast.error("Cet e-mail est déjà utilisé par un autre employé.")
      } else {
        toast.error('Erreur lors de la sauvegarde.')
      }
    }
  }

  const handleDelete = async () => {
    if (!employe) return
    const confirm = window.confirm('Supprimer cet employé ? Cette action est irréversible.')
    if (!confirm) return

    try {
      await deleteEmploye(employe.ID)
      toast.success('Employé supprimé.')
      onSuccess()
    } catch (e: any) {
      toast.error(e.message || 'Suppression impossible.')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      <form className="md:col-span-2 space-y-4 bg-white border rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {employe ? `Modifier l’employé : ${employe.nom}` : 'Ajouter un nouvel employé'}
        </h2>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex-shrink-0 flex flex-col items-center">
            <img
              src={
                photoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(form.prenom || '')}+${encodeURIComponent(form.nom || '')}&background=228B22&color=fff&size=128`
              }
              alt="Photo ou avatar de l'employé"
              className="w-32 h-32 rounded-full object-cover border-2 border-primary shadow mb-2"
              style={{ minWidth: 96, minHeight: 96 }}
            />
            {employe?.ID && !readonly && (
  <PhotoUploader
    employeId={employe.ID}
    photoUrl={form.photo}
    onPhotoUploaded={(url) => setForm(prev => ({ ...prev, photo: url }))}
  />
)}

          </div>
          <div className="flex gap-4 items-center w-full">
            <Input id="nom" name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className="font-bold text-lg" readOnly={readonly} />
            <Input id="prenom" name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className="font-bold text-lg" readOnly={readonly} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {[
    { id: 'matricule', label: 'Matricule' },
    { id: 'email', label: 'Email' },
    { id: 'telephone', label: 'Téléphone' },
    { id: 'adresse', label: 'Adresse' },
    { id: 'ville', label: 'Ville' },
    { id: 'pays', label: 'Pays' },
    { id: 'service', label: 'Service' },
    { id: 'departement', label: 'Département' },
  ].map(({ id, label }) => (
    <div className="relative" key={id}>
      <Input
        id={id}
        name={id}
        value={String(form[id as keyof typeof form] ?? '')}
        onChange={handleChange}
        onFocus={() => handleFocus(id)}
        onBlur={() => handleBlur(id)}
        className="border rounded px-3 py-3 w-full focus:outline-none focus:ring focus:border-primary"
        readOnly={readonly}
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



        <div className="flex items-start gap-4 mt-2">
          <Input
            id="latitude"
            name="latitude"
            value={form.latitude ?? ''}
            placeholder="Latitude"
            className="w-full md:max-w-xs h-10"
            readOnly={readonly}
          />
          <Input
            id="longitude"
            name="longitude"
            value={form.longitude ?? ''}
            readOnly
            placeholder="Longitude"
            className="w-full md:max-w-xs h-10"
            
          />
          {!readonly && (
            <Button
            type="button"
            className="bg-primary hover:bg-primary/90 text-white font-semibold h-10 px-6 mt-[2px] min-w-[200px] text-sm"
            onClick={() => setOpenMap(true)}
            
          >
            📍Choisir sur la carte
          </Button>
          )}
          
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Statut</span>
            <Switch checked={form.actif} onChange={(val) => setForm({ ...form, actif: val })} disabled={readonly} />
            <span>{form.actif ? 'Actif' : 'Inactif'}</span>
          </div>
          <div className="flex gap-3 ml-auto">
            {employe && (
              !readonly && (
              <Button type="button" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleDelete}>
                Supprimer
              </Button>
            ))}
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Fermer la fiche
              </Button>
            )}
            {!readonly && (
            <Button type="button" className="bg-primary text-white" onClick={handleSubmit}>
              {employe ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
            )}
          </div>
        </div>
      </form>

      <div className="md:col-span-1">
        {employe && (
          <div className="bg-white border rounded shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Tournées affectées</h3>
              {!readonly && (
  <Button
    type='button'
    variant="outline"
    className="text-sm"
    onClick={() => setShowAffectation(!showAffectation)}
  >
    {showAffectation ? 'Fermer le formulaire' : '➕ Affecter une tournée'}
  </Button>
)}

            </div>

            <AffectationsEmploye
              employeId={employe.ID}
              key={refreshAffectations.toString()}
              readonly={readonly}
            />

            {showAffectation && (
              <div className="mt-4">
                <AffectationForm
                  employeId={employe.ID}
                  onAffectationComplete={() => {
                    setRefreshAffectations(prev => !prev)
                    setShowAffectation(false)
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={openMap}>
        <DialogContent className="max-w-4xl w-full p-4">
          <h2 className="text-lg font-semibold mb-4">Choisir une position sur la carte</h2>
          <CartePointArret
            latitude={form.latitude || 33.5}
            longitude={form.longitude || -7.6}
            onSelectPosition={(lat, lng) => {
              setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
            }}
          />
          <div className="text-right mt-4">
            <Button variant="outline" onClick={() => setOpenMap(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FormulaireEmploye
