import { Tooltip } from '../ui/tooltip'
import { CalendarDays } from 'lucide-react'

export default function TooltipTest() {
  return (
    <div style={{ padding: 80 }}>
      <Tooltip label="Tooltip test !">
        <button className="p-3 bg-gray-200 rounded">
          <CalendarDays className="w-6 h-6" />
        </button>
      </Tooltip>
    </div>
  );
}
