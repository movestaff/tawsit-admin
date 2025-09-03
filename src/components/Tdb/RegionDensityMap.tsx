import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap, LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { fetchEmployes,  fetchDensityMapCenter } from '../../lib/api';


interface RegionDensity {
  ville: string;
  latitude: number;
  longitude: number;
  count: number;
  ratio: number;
}

interface EmployeRaw {
  ville: string;
  latitude: number | null;
  longitude: number | null;
}

/** 🔧 FitToData: se charge du centrage dès que les données existent */
function FitToData({ regions }: { regions: RegionDensity[] }) {
  const map = useMap();

  // Clé stable pour éviter des recalculs inutiles
  const signature = useMemo(
    () => regions.map(r => `${r.latitude},${r.longitude}`).join('|'),
    [regions]
  );

  useEffect(() => {
    if (!regions.length) return;

    const pts = regions.map(r => L.latLng(Number(r.latitude), Number(r.longitude)));
    const bounds = L.latLngBounds(pts);
    if (!bounds.isValid()) return;

    // Laisse le temps à la carte d'avoir sa taille réelle,
    // puis fit (sinon Leaflet calcule sur un container encore compacté)
    const run = () => {
      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        map.setView(bounds.getCenter(), 12, { animate: true });
      } else {
        map.fitBounds(bounds.pad(0.2), { animate: true });
      }
      // Sécurise l’affichage (cas de containers flex/grid)
      setTimeout(() => map.invalidateSize(), 0);
    };

    if ((map as any)._loaded) run();
    else map.once('load', run);

    // cleanup: rien à faire
  }, [map, signature]);

  return null;
}



function RecenterButton({ regions }: { regions: RegionDensity[] }) {
  const map = useMap();

  const recenter = () => {
    if (!regions.length) return;

    const pts = regions.map(r => L.latLng(Number(r.latitude), Number(r.longitude)));
    const bounds = L.latLngBounds(pts);
    if (!bounds.isValid()) return;

    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.setView(bounds.getCenter(), 12, { animate: true });
    } else {
      map.fitBounds(bounds.pad(0.2), { animate: true });
    }
    setTimeout(() => map.invalidateSize(), 0);
  };

  return (
    <div className="absolute top-3 right-3 z-[1000] pointer-events-auto">
      <button
        onClick={recenter}
        className="rounded-md bg-white/90 px-3 py-1 text-sm shadow border hover:bg-white"
      >
        Recentrer
      </button>
    </div>
  );
}


export function RegionDensityMap() {
  const [regions, setRegions] = useState<RegionDensity[]>([]);

  useEffect(() => {
    const fetchDensity = async () => {
      const employes: EmployeRaw[] = await fetchEmployes();

      const filtered = (employes || []).filter(
        (e) => e?.ville && e.latitude !== null && e.longitude !== null
      );

      const total = filtered.length;

      const grouped = filtered.reduce<Record<string, RegionDensity>>((acc, curr) => {
        const key = String(curr.ville);
        if (!acc[key]) {
          acc[key] = {
            ville: key,
            latitude: Number(curr.latitude),
            longitude: Number(curr.longitude),
            count: 0,
            ratio: 0,
          };
        }
        acc[key].count += 1;
        return acc;
      }, {});

      const result: RegionDensity[] = Object.values(grouped).map((region) => ({
        ...region,
        ratio: total > 0 ? parseFloat((region.count / total).toFixed(2)) : 0,
      }));

      setRegions(result);
    };

    fetchDensity();
  }, []);

  function FallbackCenter({ hasData }: { hasData: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (hasData) return; // si on a des points, on ne fait rien

    let canceled = false;
    (async () => {
      try {
        const info = await fetchDensityMapCenter();
        if (canceled) return;

        if (info?.mode === 'point' && info.center) {
          map.setView([info.center.lat, info.center.lng], info.zoom ?? 12, { animate: true });
        } else if (info?.mode === 'bounds' && info.bounds) {
          const b = L.latLngBounds(
            [info.bounds.south, info.bounds.west],
            [info.bounds.north, info.bounds.east]
          );
          map.fitBounds(b.pad(info.pad ?? 0.2), { animate: true });
        } else {
          // mode 'timezone' → pas de coordonnées; on applique seulement un zoom conseillé
          // et on tente la géoloc navigateur pour récupérer un centre plausible.
          const targetZoom =
            info && info.mode === 'point' && 'zoom' in info && typeof info.zoom === 'number'
              ? info.zoom
              : 6;
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], targetZoom, { animate: true }),
              () => map.setView([0, 0], 2, { animate: true }),
              { enableHighAccuracy: true, timeout: 4000 }
            );
          } else {
            map.setView([0, 0], 2, { animate: true });
          }
        }

        setTimeout(() => map.invalidateSize(), 0);
      } catch (e) {
        // dernier filet
        map.setView([0, 0], 2, { animate: true });
      }
    })();

    return () => { canceled = true; };
  }, [map, hasData]);

  return null;
}

  return (
    <div className="rounded-xl bg-white shadow-soft p-4">
      <h2 className="text-lg font-semibold mb-4">Indice de densité des employés par région</h2>

      {/* ✅ centre/zoom par défaut conservés si aucune donnée */}
      <MapContainer
        center={[33.5731, -7.5898]}
        zoom={11}
        className="h-[400px] w-full rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ✅ centrage automatique sur les données */}
        <FitToData regions={regions} />
         <RecenterButton regions={regions} />

           <FallbackCenter hasData={regions.length > 0} />

        {regions.map((region, i) => (
          <CircleMarker
            key={`${region.ville}-${i}`}
            center={[region.latitude, region.longitude] as LatLngExpression}
            radius={10 + region.ratio * 30}
            pathOptions={{ color: 'blue', fillOpacity: 0.5 }}
          >
            <Tooltip>
              <div>
                <strong>{region.ville}</strong><br />
                Employés: {region.count}<br />
                Ratio: {(region.ratio * 100).toFixed(1)}%
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
