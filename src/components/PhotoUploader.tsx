import React, { useRef, useState } from 'react'
import { Button } from './ui/button'
import { toast } from 'react-toastify'
import { uploadPhotoEmploye } from '../lib/api'
import { useAuthStore } from '../store/authStore'

interface Props {
  employeId: string
  photoUrl?: string
  onPhotoUploaded: (url: string) => void
}


const PhotoUploader: React.FC<Props> = ({ employeId, onPhotoUploaded }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

     // 🧪 LOGS DE DIAGNOSTIC
  const rawToken = localStorage.getItem('supabase.auth.token')
  const localToken = rawToken ? JSON.parse(rawToken)?.currentSession?.access_token : null
  const zustandToken = useAuthStore.getState().token
  const societeId = useAuthStore.getState().selectedSocieteId

  console.log('🛡️ TOKEN:', localToken || zustandToken)
  console.log('🏢 SOCIETE ID:', societeId)


    setLoading(true)
    try {
      
      const photoPath = await uploadPhotoEmploye(employeId, file)
      onPhotoUploaded(photoPath)
      toast.success('Photo mise à jour.')
    } catch (err: any) {
      toast.error(err.message || 'Erreur upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <Button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="text-sm"
      >
        {loading ? "Envoi..." : "Changer la photo"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default PhotoUploader
