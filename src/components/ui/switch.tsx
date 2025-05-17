// ✅ src/components/ui/switch.tsx
import * as React from 'react'
import { Switch as HeadlessSwitch } from '@headlessui/react'
import clsx from 'clsx'

interface SwitchProps {
checked: boolean
onChange: (value: boolean) => void
label?: string
className?: string
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, className }) => {
return (
<div className={clsx('flex items-center gap-2', className)}>
<HeadlessSwitch
checked={checked}
onChange={onChange}
className={clsx(
'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
checked ? 'bg-green-600' : 'bg-gray-300'
)}
>
<span
className={clsx(
'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
checked ? 'translate-x-6' : 'translate-x-1'
)}
/>
</HeadlessSwitch>
{label && <span className="text-sm text-gray-700">{label}</span>}
</div>
)
}