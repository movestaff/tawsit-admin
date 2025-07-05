import React from 'react'
import { Dialog } from '@headlessui/react'
import FormulairePlanification from './FormulairePlanification'

interface Props {
  open: boolean
  onClose: () => void
  onRefresh: () => void
  planification: any | null
  tournees: any[]
}

const ModalPlanification: React.FC<Props> = ({ open, onClose, onRefresh, planification, tournees }) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold mb-4">
            {planification ? 'Modifier la planification' : 'Nouvelle planification'}
          </Dialog.Title>

          <FormulairePlanification
            planification={planification}
            onSuccess={() => {
              onClose()
              onRefresh()
            }}
            onCancel={onClose}
            tournees={tournees}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default ModalPlanification
