// src/components/autoplanification/CarteClusters.tsx

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import clusterIconUrl from '/icons/cluster-pin.png';
import siteIconUrl from '/icons/site-pin.png';

interface CarteClustersProps {
  previewResult: any;
  sites: { id: string; lat: number; lng: number; nom: string }[];
  onSelectCluster: (data: { groupeId: string; clusterIndex: number }) => void;
  clustersByGroupe: any;
  
}



export default function CarteClusters({
  previewResult,
  sites,
  onSelectCluster,
}: CarteClustersProps) {
  if (!previewResult) return null;

  const defaultPosition = sites.length
    ? [sites[0].lat, sites[0].lng]
    : [45.5, -73.6];

  const clusterIcon = L.icon({
    iconUrl: clusterIconUrl,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });

  const siteIcon = L.icon({
    iconUrl: siteIconUrl,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });

  

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <MapContainer center={defaultPosition as [number, number]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔴 Sites de destination */}
        {sites.map(site => (
          <Marker
            key={`site-${site.id}`}
            position={[site.lat, site.lng]}
            icon={siteIcon}
          >
            <Popup>
              <Typography variant="subtitle2">🏁 Site de destination</Typography>
              <Typography variant="body2">{site.nom}</Typography>
              <Typography variant="body2">Lat: {site.lat.toFixed(6)}</Typography>
              <Typography variant="body2">Lng: {site.lng.toFixed(6)}</Typography>
            </Popup>
          </Marker>
        ))}

        {/* 🟢 Clusters (points d'arrêt) */}
        {previewResult.groupes?.map((groupe: { id: string; nom: string }) =>
          (previewResult.clustersByGroupe?.[groupe.id] ?? [])
            .sort(
              (
                a: { latitude: number; longitude: number; ordre?: number; distance_max_m?: number; valide?: boolean; employes?: any[] },
                b: { latitude: number; longitude: number; ordre?: number; distance_max_m?: number; valide?: boolean; employes?: any[] }
              ) => (a.ordre ?? 0) - (b.ordre ?? 0)
            )
            .map((cluster: {
              latitude: number;
              longitude: number;
              ordre?: number;
              distance_max_m?: number;
              valide?: boolean;
              employes?: any[];
            }, idx: number) => (
              <Marker
                key={`${groupe.id}-${idx}`}
                position={[cluster.latitude, cluster.longitude]}
                icon={clusterIcon}
                eventHandlers={{
                  click: () => onSelectCluster({ groupeId: groupe.id, clusterIndex: idx }),
                }}
              >
                <Popup>
                  <Typography variant="subtitle2">{groupe.nom} - Cluster #{idx + 1}</Typography>
                  <Typography variant="body2">Lat: {cluster.latitude.toFixed(6)}</Typography>
                  <Typography variant="body2">Lng: {cluster.longitude.toFixed(6)}</Typography>
                  <Typography variant="body2">Distance max: {cluster.distance_max_m ?? 'N/A'} m</Typography>
                  <Typography variant="body2">Valide: {cluster.valide ? '✅' : '❌'}</Typography>
                  <Typography variant="body2">Nb employés: {cluster.employes?.length ?? 0}</Typography>
                </Popup>
              </Marker>
            ))
        )}
      </MapContainer>
    </Box>
  );
}
