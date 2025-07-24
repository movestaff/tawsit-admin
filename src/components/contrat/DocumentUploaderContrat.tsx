import React, { useRef, useState } from 'react'
import { Button } from '../ui/button'
import { toast } from 'react-toastify'
import { uploadDocumentContrat } from '../../lib/api'


interface Props {
  contratId: string
  onUploaded: () => void
}

const sanitizeFileName = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
}

const DocumentUploaderContrat: React.FC<Props> = ({ contratId, onUploaded }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'image/png',
  'image/jpeg'
];
 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    alert('❌ Format non supporté.\nFormats autorisés : PDF, Word, Excel, ODT/ODS, PNG, JPG.');
    return;
  }

  setLoading(true)

  try {
    await uploadDocumentContrat(contratId, file)
    toast.success('✅ Document ajouté avec succès.')
    onUploaded()
  } catch (err: any) {
    console.error(err)
    toast.error(err.message || 'Erreur lors de l\'upload')
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? "Envoi..." : "Ajouter un document"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default DocumentUploaderContrat
