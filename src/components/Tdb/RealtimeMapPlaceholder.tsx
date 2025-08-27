export function RealtimeMapPlaceholder() {
  return (
    <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100 h-[320px] flex items-center justify-center text-gray-500">
      <div className="text-center">
        <div className="text-sm font-medium text-gray-700 mb-1">Carte temps réel</div>
        <div className="text-xs">Intégrez ici Leaflet / MapLibre (OSM)</div>
      </div>
    </div>
  );
}
