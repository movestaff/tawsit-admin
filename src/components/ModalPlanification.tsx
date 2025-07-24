import React from 'react'
import { Dialog } from '@headlessui/react'
import FormulairePlanification from './FormulairePlanification'



interface Props {
  open: boolean
  onClose: () => void
  onRefresh: () => void
  planification: any | null
  tournees: any[]
  enDuplication?: boolean 
}


const ModalPlanification: React.FC<Props> = ({ open, onClose, onRefresh, planification, tournees, enDuplication }) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold mb-4 flex items-center justify-between">
          {enDuplication
           ? 'Duplication de planification'
            : planification
             ? 'Modifier la planification'
             : 'Nouvelle planification'}

                {enDuplication && (
                <span className="ml-4 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                 Duplication
               </span>
                  )} 
               </Dialog.Title>

                    <FormulairePlanification
            planification={planification}
            enDuplication={enDuplication} // ✅ Ajout
            onSuccess={() => {
              onClose()
              onRefresh()
            } }
            onCancel={onClose}
            tournees={tournees} id={''} readonly={false}/>

        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default ModalPlanification
