import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchEmployes } from '../../lib/api';

interface RegionDensity {
  ville: string;
  latitude: number;
  longitude: number;
  count: number;
  ratio: number;
}

interface EmployeRaw {
  ville: string;
  latitude: number;
  longitude: number;
}

export function RegionDensityMap() {
  const [regions, setRegions] = useState<RegionDensity[]>([]);

  useEffect(() => {
    const fetchDensity = async () => {
      const employes: EmployeRaw[] = await fetchEmployes();

      const filtered = employes.filter(
        (e) => e.ville && e.latitude !== null && e.longitude !== null
      );

      const total = filtered.length;

      const grouped = filtered.reduce((acc: Record<string, RegionDensity>, curr) => {
        const key = curr.ville;
        if (!acc[key]) {
          acc[key] = {
            ville: key,
            latitude: curr.latitude,
            longitude: curr.longitude,
            count: 0,
            ratio: 0,
          };
        }
        acc[key].count++;
        return acc;
      }, {});

      const result: RegionDensity[] = Object.values(grouped).map((region) => ({
        ...region,
        ratio: parseFloat((region.count / total).toFixed(2)),
      }));

      setRegions(result);
    };

    fetchDensity();
  }, []);

  return (
    <div className="rounded-xl bg-white shadow-soft p-4">
      <h2 className="text-lg font-semibold mb-4">Indice de densité des employés par région</h2>
      <MapContainer center={[5.348, -4.027]} zoom={6} className="h-[400px] w-full rounded-lg z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {regions.map((region, i) => (
          <CircleMarker
            key={i}
            center={[region.latitude, region.longitude]}
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
