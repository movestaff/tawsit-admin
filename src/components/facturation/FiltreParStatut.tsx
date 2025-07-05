import { Select } from "../../components/ui/select"

interface Props {
  value: string
  options: string[]
  onChange: (val: string) => void
  label?: string
}

export default function FiltreParStatut({
  value,
  options,
  onChange,
  label = 'Filtrer par statut'
}: Props) {
  return (
    <div className="flex flex-col gap-1 w-64">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Tous</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {capitalize(opt)}
          </option>
        ))}
      </Select>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
