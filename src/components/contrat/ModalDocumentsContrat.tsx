import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

import {
  deleteDocumentContrat,
  getDocumentContratById,
  fetchDocumentsContrat
} from '../../lib/api';
import DocumentUploaderContrat from './DocumentUploaderContrat';

interface Document {
  id: string;
  nom: string;
  url: string;
  signedUrl?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  contrat: {
    id: string;
    statut_validation?: string;
  };
}

export default function ModalDocumentsContrat({ open, onClose, contrat }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const contratId = contrat.id;
  const isValide = (contrat.statut_validation || '').toLowerCase() === 'valide';

  const chargerDocumentsAvecSignedUrls = async () => {
    setLoading(true);
    try {
      const liste = await fetchDocumentsContrat(contratId);
      const withSignedUrls = await Promise.all(
        liste.map(async (doc: Document) => {
          try {
            const signed = await getDocumentContratById(doc.id);
            return { ...doc, signedUrl: signed.signedUrl };
          } catch (error) {
            console.error('Erreur récupération signedUrl pour', doc.id, error);
            return { ...doc, signedUrl: null };
          }
        })
      );
      setDocuments(withSignedUrls);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      toast.error('Erreur lors du chargement des documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    const confirm = window.confirm('Confirmer la suppression de ce document ?');
    if (!confirm) return;

    try {
      await deleteDocumentContrat(docId);
      toast.success('✅ Document supprimé avec succès.');
      await chargerDocumentsAvecSignedUrls();
    } catch (error: any) {
      console.error('Erreur suppression document:', error);
      toast.error(error?.message || '❌ Erreur lors de la suppression.');
    }
  };

  const handleClose = () => {
    setDocuments([]);
    onClose();
  };

  useEffect(() => {
    if (open) {
      chargerDocumentsAvecSignedUrls();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>📑 Documents du Contrat</DialogTitle>
      <DialogContent>
        {isValide && (
          <Typography variant="body2" color="error" gutterBottom>
            ⚠️ Ce contrat est validé. Ajout et suppression de documents désactivés.
          </Typography>
        )}

        {loading ? (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        ) : (
          <div className="space-y-2">
            {documents.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                Aucun document pour ce contrat.
              </Typography>
            )}
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center border p-2 rounded hover:bg-gray-50"
              >
                <Typography variant="body2" className="truncate max-w-[200px]">
                  {doc.nom}
                </Typography>
                <div className="flex gap-2 items-center">
                  {doc.signedUrl ? (
                    <IconButton
                      component="a"
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <Eye className="text-green-600" size={20} />
                    </IconButton>
                  ) : (
                    <Typography variant="caption" color="error">
                      lien indisponible
                    </Typography>
                  )}
                  {!isValide && (
                    <IconButton onClick={() => handleDelete(doc.id)} size="small">
                      <Trash2 className="text-red-600" size={20} />
                    </IconButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isValide && (
          <div className="mt-4">
            <DocumentUploaderContrat
              contratId={contratId}
              onUploaded={chargerDocumentsAvecSignedUrls}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
