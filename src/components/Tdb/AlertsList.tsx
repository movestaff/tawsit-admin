type Alert = {
  id: string;
  type: 'retard' | 'incident' | 'vitesse' | 'absence';
  label: string;
  detail?: string;
  sinceMin?: number;
  severity: 'low' | 'medium' | 'high';
};

const alerts: Alert[] = [
  { id: 'a1', type: 'retard',  label: 'Tournée #TR-128 en retard', detail: 'Arrêt 3 • 12 min', sinceMin: 12, severity: 'medium' },
  { id: 'a2', type: 'vitesse', label: 'Excès de vitesse - Bus 24', detail: '78 km/h en zone 60', sinceMin: 3,  severity: 'high' },
  { id: 'a3', type: 'incident',label: 'Signalement conducteur', detail: 'Panne ponctuelle',     sinceMin: 45, severity: 'low' },
];

const chip = (type: Alert['type']) => {
  const map: Record<Alert['type'], string> = {
    retard:  'bg-amber-50 text-amber-700 border border-amber-200',
    incident:'bg-blue-50  text-blue-700  border border-blue-200',
    vitesse: 'bg-red-50   text-red-700   border border-red-200',
    absence: 'bg-gray-50  text-gray-600  border border-gray-200',
  };
  return map[type];
};

const sevDot = (sev: Alert['severity']) => {
  const map: Record<Alert['severity'], string> = {
    low: 'bg-primary',
    medium: 'bg-accent',
    high: 'bg-red-600',
  };
  return map[sev];
};

export function AlertsList() {
  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Alertes en cours</h3>
        <button className="text-sm text-primary hover:underline">Voir tout</button>
      </div>

      <ul className="space-y-3">
        {alerts.map(a => (
          <li key={a.id} className="flex items-start gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs ${chip(a.type)}`}>
              {a.type}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{a.label}</span>
                <span className={`inline-block w-2 h-2 rounded-full ${sevDot(a.severity)}`} />
              </div>
              {a.detail && <div className="text-xs text-gray-500">{a.detail}</div>}
            </div>
            {a.sinceMin != null && (
              <div className="text-xs text-gray-400 shrink-0">{a.sinceMin} min</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
