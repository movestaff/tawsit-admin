import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../../components/ui/button';
import { toast } from 'react-toastify';
import InputFlottant from '../../components/ui/InputFlottant';
import { Switch } from '../../components/ui/switch';

export interface Prestataire {
  id?: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  responsable?: string;
  contact?: string;
  id_fiscale?: string;
  actif: boolean;
}

interface ModalEditionPrestataireProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Prestataire) => Promise<void>;
  initialData?: Prestataire | null;
}

export default function ModalEditionPrestataire({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ModalEditionPrestataireProps) {
  const [form, setForm] = useState<Prestataire>({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    responsable: '',
    contact: '',
    id_fiscale: '',
    actif: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        nom: initialData.nom ?? '',
        adresse: initialData.adresse ?? '',
        telephone: initialData.telephone ?? '',
        email: initialData.email ?? '',
        responsable: initialData.responsable ?? '',
        contact: initialData.contact ?? '',
        id_fiscale: initialData.id_fiscale ?? '',
        actif: initialData.actif ?? true,
      });
    } else {
      setForm({
        nom: '',
        adresse: '',
        telephone: '',
        email: '',
        responsable: '',
        contact: '',
        id_fiscale: '',
        actif: true,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const target = e.target;

  if (target instanceof HTMLInputElement && target.type === 'checkbox') {
    setForm((prev) => ({
      ...prev,
      [target.name]: target.checked,
    }));
  } else {
    setForm((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  }
};

  const handleSubmit = async () => {
  if (!form.nom.trim()) {
    toast.error('❌ Le nom est obligatoire.');
    return;
  }
  try {
    setLoading(true);
    await onSave(form);
    toast.success('✅ Les modifications du prestataire ont été enregistrées avec succès !');
    onClose();
  } catch (error) {
    console.error(error);
    toast.error('❌ Impossible d\'enregistrer les modifications. Veuillez réessayer.');
  } finally {
    setLoading(false);
  }
};


  const { actif, ...textFields } = form;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            {initialData ? 'Éditer Prestataire' : 'Nouveau Prestataire'}
          </Dialog.Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(textFields).map(([key, value]) => (
              <InputFlottant
                key={key}
                id={key}
                name={key}
                label={key === 'id_fiscale' ? 'ID Fiscale' : key.charAt(0).toUpperCase() + key.slice(1)}
                value={value ?? ''}
                onChange={handleChange}
                required={key === 'nom'}
              />
            ))}
          </div>

         <div className="mt-4">
  <Switch
    checked={actif}
    onChange={(value) => setForm((prev) => ({ ...prev, actif: value }))}
    label="Actif"
  />
</div>


          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
