import type { ToolbarProps } from 'react-big-calendar';
import { Button } from './ui/button';

export default function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-gray-50 rounded-t-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Button variant="primary" size="md" onClick={() => onNavigate('PREV')}>
          ◀ Précédent
        </Button>
        <Button variant="outline" size="md" onClick={() => onNavigate('TODAY')}>
          📅 Aujourd’hui
        </Button>
        <Button variant="primary" size="md" onClick={() => onNavigate('NEXT')}>
          Suivant ▶
        </Button>
        <span className="ml-4 text-lg font-medium text-primary">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'month' ? 'primary' : 'outline'}
          size="md"
          onClick={() => onView('month')}
        >
          Mois
        </Button>
        <Button
          variant={view === 'week' ? 'primary' : 'outline'}
          size="md"
          onClick={() => onView('week')}
        >
          Semaine
        </Button>
        <Button
          variant={view === 'day' ? 'primary' : 'outline'}
          size="md"
          onClick={() => onView('day')}
        >
          Jour
        </Button>
        <Button
          variant={view === 'agenda' ? 'primary' : 'outline'}
          size="md"
          onClick={() => onView('agenda')}
        >
          Agenda
        </Button>
      </div>
    </div>
  );
}
