
// src/components/AutoPlanification/MapPreviewStep.tsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, IconButton, TextField
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GroupIcon from '@mui/icons-material/Group';
import RouteIcon from '@mui/icons-material/Route';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import L from 'leaflet';
import BusinessIcon from '@mui/icons-material/Business';

import 'leaflet/dist/leaflet.css';
import {
  Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Checkbox, Chip
} from '@mui/material';
import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Icônes Leaflet fix
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = L.icon({
  iconUrl: '/marker-icon.png',  // Chemin relatif au dossier public
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

// Palette stable (modifiable)
const VEHICLE_COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
  '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
  '#bcbd22', '#17becf'
];

// Petit hash stable pour distribuer les couleurs sans dépendance externe
const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i), h |= 0;
  return Math.abs(h);
};
const colorForVehicule = (key: string) => VEHICLE_COLORS[hashString(key) % VEHICLE_COLORS.length];

/** Marqueur HTML numéroté et coloré */
const numberIcon = (n: number | string, color: string) =>
  L.divIcon({
    className: '', // pas de classe par défaut
    html: `
      <div style="
        width:32px;height:32px;line-height:32px;
        border-radius:20px;
        background:${color};
        color:#fff;
        font-weight:700;
        text-align:center;
        box-shadow:0 1px 4px rgba(0,0,0,.35);
        border:2px solid rgba(255,255,255,.9);
      ">
        ${n ?? ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });


type Employe = {
  ID: string;
  nom: string;
  prenom: string;
  matricule?: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
};

type Vehicule = {
  id: string;
  immatriculation?: string;
  capacite: number;
  [key: string]: any;
};

type PreviewResult = {
  groupes: Array<{ id: string; nom: string; recurrence_type?: string; [key: string]: any }>;
  clustersByGroupe?: { [groupeId: string]: any[] };
  employesByGroupe?: { [groupeId: string]: Employe[] };
  vehiculesDisponibles?: Array<Vehicule>;
  conducteursActifs?: any[];
  siteById?: { [siteId: string]: { lat: number; lng: number; nom?: string; [key: string]: any } };
};

type Props = {
  previewResult: PreviewResult;
    // 🆕 callbacks (fournis par le parent)
  onMoveMarker?: (groupeId: string, clusterIdx: number, lat: number, lng: number) => void;
  onSetOrdre?: (groupeId: string, clusterIdx: number, newOrdre: number) => void;
  onEditEmployes?: (groupeId: string, clusterIdx: number, employeIds: string[]) => void;
};

  const MapPreviewStep: React.FC<Props> = ({ previewResult, onMoveMarker, onSetOrdre, onEditEmployes  }) => {

     if (!previewResult || !previewResult.groupes) {
    return (
      <Box p={2}>
        <Typography variant="body1" color="error">
          ❌ Données de prévisualisation incomplètes ou invalides.
        </Typography>
      </Box>
    );
  }
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);

  const theme = useMemo(
  () =>
    createTheme({
      palette: {
        primary: {
          main: '#228B22',
          dark: '#1d741d',
          contrastText: '#ffffff',
        },
      },
    }),
  []
);



  // Stats
  const totalEmployes = Object.values(previewResult.employesByGroupe || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  // ➜ 1️⃣ Clusters à afficher sur la MAP (exclure retourFlexible)
const mapClusters = Object.values(previewResult.clustersByGroupe || {})
  .flat()
  .filter((c: any) => !c.retourFlexible);
const totalClusters = mapClusters.length;

// ➜ 2️⃣ TOUS les clusters (inclure retourFlexible) pour compter les véhicules
const allClustersForCount = Object.values(previewResult.clustersByGroupe || {}).flat();
const vehiculesUtilisesSet = new Set(
  allClustersForCount
    .map(c => c.vehicule)
    .filter(v => v !== undefined && v !== null)
);
const totalVehiculesUtilises = vehiculesUtilisesSet.size;


  // Centre map
  const allCoords = mapClusters.map((c: any) => [c.latitude, c.longitude])
  .filter(([lat, lng]) => typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng));
  const avgLat = allCoords.length ? allCoords.reduce((sum, [lat]) => sum + lat, 0) / allCoords.length : 45.5;
  const avgLng = allCoords.length ? allCoords.reduce((sum, [, lng]) => sum + lng, 0) / allCoords.length : -73.5;

  // Ouvrir le détail
  const handleOpenDialog = (cluster: any, groupe: any) => {
  setSelectedCluster({ ...cluster, groupe });
  setLastSpatialMode('none'); // Réinitialiser le mode spatial

  // initialiser les IDs (cas départ: c.employes = IDs)
  const ids = Array.isArray(cluster.employes)
    ? cluster.employes.map((x: any) => (typeof x === 'string' ? x : x?.ID)).filter(Boolean)
    : [];
  setEditedEmployeIds(ids);
 // reset recherche/filtre à l’ouverture
  setQ('');
  resetFilters();
  setOpenDialog(true);
};


  const vehiculesByIndex = (previewResult.vehiculesDisponibles ?? []).reduce((acc, v, idx) => {
  acc[idx] = v;
  return acc;
}, {} as Record<number, Vehicule>);

  const [filterGroupe, setFilterGroupe] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterVehicule, setFilterVehicule] = useState('');

  const [editedEmployeIds, setEditedEmployeIds] = useState<string[]>([]);

  // 🆕 Barre de recherche + facettes
const [q, setQ] = useState('');
const [filters, setFilters] = useState<{ ville: string; service: string; departement: string; actif: boolean }>({
  ville: '',
  service: '',
  departement: '',
  actif: true,
});


// 🆕 paramètres de sélection de masse
const [radiusM, setRadiusM] = useState<number>(300); // rayon en mètres (défaut 300m)
const [topK, setTopK] = useState<number>(10);        // K plus proches (défaut 10)

// 🆕 mémorisation du dernier mode spatial utilisé par les boutons
//    'none' = aucun, 'radius' = Par rayon, 'topk' = Top-K proches

const [lastSpatialMode, setLastSpatialMode] = useState<'none' | 'radius' | 'topk'>('none');

// 🆕 Sélection polygone (carte)
const [polygonMode, setPolygonMode] = useState(false);
const [polygonActiveGroupeId, setPolygonActiveGroupeId] = useState<string | null>(null);

// 🆕 point-in-polygon (ray casting) — lat/lng en [ [lat,lng], ... ]
const pointInPolygon = (lat: number, lng: number, poly: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][1], yi = poly[i][0];
    const xj = poly[j][1], yj = poly[j][0];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};



// 🆕 Helpers sélection (basés sur la liste filtrée actuelle dans le Dialog)
const selectAllFiltered = () => {
  const ids = filteredEmployees.map((e: any) => e.ID);
  setEditedEmployeIds((prev) => Array.from(new Set([...prev, ...ids])));
};

const selectNoneFiltered = () => {
  const filteredIds = new Set(filteredEmployees.map((e: any) => e.ID));
  setEditedEmployeIds((prev) => prev.filter((id) => !filteredIds.has(id)));
};

const invertFiltered = () => {
  const filteredIds = new Set(filteredEmployees.map((e: any) => e.ID));
  setEditedEmployeIds((prev) => {
    const current = new Set(prev);
    const toggled: string[] = [];
    // Ajoute ceux non cochés, retire ceux cochés… parmi le filtré
    filteredEmployees.forEach((e: any) => {
      if (current.has(e.ID)) {
        // retire
        current.delete(e.ID);
      } else {
        // ajoute
        toggled.push(e.ID);
      }
    });
    return Array.from(new Set([...Array.from(current), ...toggled]));
  });
};


// 🆕 utilitaire distance (Haversine) en mètres
const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// 🆕 helper: retrouver l'index du cluster actuellement ouvert (mêmes critères que ton "Enregistrer")
const getSelectedClusterIndex = () => {
  if (!selectedCluster) return -1;
  const arr = previewResult.clustersByGroupe?.[selectedCluster.groupe.id] ?? [];
  return arr.findIndex(
    (c: any) =>
      c.latitude === selectedCluster.latitude &&
      c.longitude === selectedCluster.longitude &&
      c.ordre === selectedCluster.ordre
  );
};



// 🆕 3.1 Sélectionner tous les employés filtrés (facettes + recherche + mode spatial actif)
// ⚠️ Local uniquement : on ne notifie PAS le parent ici (étape 1/3).
//    Le mode spatial appliqué est le DERNIER cliqué entre "Par rayon" et "Top-K proches".
const selectFilteredForCurrent = () => {
  if (!selectedCluster) return;

  const { latitude: clat, longitude: clng } = selectedCluster;

  // 1) Base = résultat des facettes + recherche
  let candidates = filteredEmployees as Array<any>;

  // 2) Appliquer le dernier mode spatial utilisé, si pertinent
  if (lastSpatialMode === 'radius' && Number.isFinite(radiusM) && radiusM > 0) {
    candidates = candidates
      .filter((e: any) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude))
      .filter((e: any) => haversine(clat, clng, e.latitude, e.longitude) <= radiusM);
  } else if (lastSpatialMode === 'topk' && Number.isFinite(topK) && topK > 0) {
    candidates = candidates
      .filter((e: any) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude))
      .map((e: any) => ({ e, d: haversine(clat, clng, e.latitude, e.longitude) }))
      .sort((a: any, b: any) => a.d - b.d)
      .slice(0, Math.max(0, Math.trunc(topK)))
      .map((x: any) => x.e);
  }

  // 3) Appliquer dans l'état local du dialog uniquement
  const ids = candidates.map((e: any) => e.ID);
  setEditedEmployeIds(ids);
};

// 🆕 3.2 Sélection par rayon autour du marker du cluster
// ⚠️ Local uniquement + on mémorise le mode spatial 'radius'.
const selectByRadiusForCurrent = () => {
  if (!selectedCluster) return;

  const { latitude: clat, longitude: clng } = selectedCluster;
  const all = (previewResult.employesByGroupe?.[selectedCluster.groupe.id] ?? [])
    .filter((e: any) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude));

  const ids = all
    .filter((e: any) => haversine(clat, clng, e.latitude, e.longitude) <= radiusM)
    .map((e: any) => e.ID);

  setEditedEmployeIds(ids);
  setLastSpatialMode('radius'); // 🆕 mémoriser ce mode
};

// 🆕 3.3 Top-K plus proches du marker
// ⚠️ Local uniquement + on mémorise le mode spatial 'topk'.
const selectTopKNearestForCurrent = () => {
  if (!selectedCluster) return;

  const { latitude: clat, longitude: clng } = selectedCluster;
  const all = (previewResult.employesByGroupe?.[selectedCluster.groupe.id] ?? [])
    .filter((e: any) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude));

  const ids = all
    .map((e: any) => ({ id: e.ID, d: haversine(clat, clng, e.latitude, e.longitude) }))
    .sort((a: any, b: any) => a.d - b.d)
    .slice(0, Math.max(0, Math.trunc(topK)))
    .map((x: any) => x.id);

  setEditedEmployeIds(ids);
  setLastSpatialMode('topk'); // 🆕 mémoriser ce mode
};




// 🆕 Liste d'employés du groupe courant (selon le cluster ouvert)
const currentEmployees = useMemo(() => {
  if (!selectedCluster) return [] as any[];
  return previewResult.employesByGroupe?.[selectedCluster.groupe.id] ?? [];
}, [previewResult, selectedCluster]);

// 🆕 Valeurs uniques pour facettes
const facetOptions = useMemo(() => {
  const villes = new Set<string>();
  const services = new Set<string>();
  const departements = new Set<string>();
  for (const emp of currentEmployees) {
    if (emp.ville) villes.add(emp.ville);
    if (emp.service) services.add(emp.service);
    if (emp.departement) departements.add(emp.departement);
  }
  return {
    villes: Array.from(villes).sort(),
    services: Array.from(services).sort(),
    departements: Array.from(departements).sort(),
  };
}, [currentEmployees]);

// 🆕 Filtrage combiné
const filteredEmployees = useMemo(() => {
  const qLower = q.trim().toLowerCase();
  return currentEmployees.filter((emp: any) => {
    const okVille = !filters.ville || emp.ville === filters.ville;
    const okService = !filters.service || emp.service === filters.service;
    const okDept = !filters.departement || emp.departement === filters.departement;
    const okActif = filters.actif ? emp.actif !== false : true;
    const okSearch =
      !qLower ||
      (emp.nom?.toLowerCase().includes(qLower)) ||
      (emp.prenom?.toLowerCase().includes(qLower)) ||
      (emp.matricule?.toLowerCase().includes(qLower)) ||
      (emp.email?.toLowerCase().includes(qLower));
    return okVille && okService && okDept && okActif && okSearch;
  });
}, [currentEmployees, q, filters]);

// 🆕 Aides rapides
const resetFilters = () => setFilters({ ville: '', service: '', departement: '', actif: true });



// 🆕 Construit une polyline ordonnée par véhicule (tous groupes confondus, hors retours flexibles)
const itinerairesParVehicule = useMemo(() => {
  const map: Record<string, { color: string; coords: [number, number][]; label: string }> = {};

  // on parcourt les groupes pour garder l'ordre (c.ordre)
  for (const groupe of previewResult.groupes) {
    const clusters = (previewResult.clustersByGroupe?.[groupe.id] ?? [])
      .filter((c: any) => !c.retourFlexible)
      .slice()
      .sort((a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0));

    for (const c of clusters) {
      const vehKey = String(c.vehicule ?? 'no-veh');         // clé couleur
      const color = colorForVehicule(vehKey);
      const veh = previewResult.vehiculesDisponibles?.[c.vehicule ?? 0];
      const label = veh?.immatriculation ? veh.immatriculation : `Véhicule ${vehKey}`;

      if (!map[vehKey]) map[vehKey] = { color, coords: [], label };

      if (Number.isFinite(c.latitude) && Number.isFinite(c.longitude)) {
        map[vehKey].coords.push([c.latitude, c.longitude]);
      }
    }
  }

  return Object.entries(map).map(([vehKey, v]) => ({ vehKey, ...v }));
}, [previewResult]);



//*****************************************************************************.. */
//**************************************************************************** */

  return (

    <ThemeProvider theme={theme}>
    <CssBaseline />

    <Box p={2}>
      {/* Carte */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
         
<Box sx={{ position: 'relative' }}>
  {/* 🆕 Légende couleurs véhicules */}
  <Box sx={{
    position: 'absolute', right: 8, top: 8, zIndex: 1000,
    bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #e0e0e0',
    borderRadius: 1, p: 1, maxWidth: 260
  }}>
    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: .5 }}>
      Légende véhicules
    </Typography>
    {itinerairesParVehicule.map(({ vehKey, color, label }) => (
      <Box key={vehKey} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5 }}>
        <span style={{ width: 14, height: 6, background: color, display: 'inline-block', borderRadius: 2 }} />
        <Typography variant="caption">{label}</Typography>
      </Box>
    ))}
  </Box>




         
          <MapContainer center={[avgLat, avgLng]} zoom={12} style={{ height: '500px', width: '100%' }}>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

   {/* 🆕 Polylignes par véhicule (dessinées AVANT les marqueurs) */}
    {itinerairesParVehicule.map(({ vehKey, color, coords }) =>
      coords.length >= 2 ? (
        <Polyline
          key={`poly-${vehKey}`}
          positions={coords}
          pathOptions={{ color, weight: 4, opacity: 0.9 }}
        />
      ) : null
    )}

  {/* Affichage des clusters de type DEPART uniquement (exclusion des retours flexibles) */}
  {previewResult.groupes.map((groupe) =>
  (previewResult.clustersByGroupe?.[groupe.id] ?? [])
    .filter(c => !c.retourFlexible)
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
    // ⬇️ utiliser un body en { … } et retourner explicitement le JSX
    .map((c, idx) => {
      // ✅ on peut maintenant déclarer des const ici sans erreur
      const vehKey = String(c.vehicule ?? 'no-veh');
      const color = colorForVehicule(vehKey);
      const ordre = (c.ordre ?? (idx + 1));

      return (
        <Marker
          key={`${groupe.id}-${idx}`}
          position={[c.latitude, c.longitude]}
          // ⬇️ si tu veux le badge numéroté coloré, utilise numberIcon :
          icon={numberIcon(ordre, color)}
          // si tu préfères garder l’icône par défaut, remets customIcon
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target;
              const { lat, lng } = m.getLatLng();
              onMoveMarker?.(groupe.id, idx, lat, lng);
            }
          }}
        >
          <Popup>
            <Typography variant="subtitle2">{groupe.nom}</Typography>
            <Typography variant="body2">Cluster #{idx + 1}</Typography>
            <Typography variant="body2">Ordre : {c.ordre ?? '-'}</Typography>
            <Typography variant="body2">
              Véhicule: {vehiculesByIndex[c.vehicule]?.immatriculation ?? 'N/A'}
            </Typography>
            <Typography variant="body2">Distance max : {c.distance_max_m ?? 'N/A'} m</Typography>
            <Typography variant="body2">Valide : {c.valide ? '✅' : '❌'}</Typography>
            <Typography variant="body2">Nb Employés : {c.employes?.length ?? 0}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" variant="outlined" onClick={() => onSetOrdre?.(groupe.id, idx, (c.ordre ?? (idx+1)) - 1)}>▲ ordre</Button>
              <Button size="small" variant="outlined" onClick={() => onSetOrdre?.(groupe.id, idx, (c.ordre ?? (idx+1)) + 1)}>▼ ordre</Button>
              <Button size="small" variant="outlined" onClick={() => handleOpenDialog(c, groupe)}>Éditer employés</Button>
            </Box>
          </Popup>
        </Marker>
      );
    })
)}

  {/* Sites de destination */}
  {Object.entries(previewResult.siteById || {}).map(([siteId, site]) => (
    <Marker
      key={`site-${siteId}`}
      position={[site.lat, site.lng]}
      icon={L.icon({
        iconUrl: '/destination-icon.png',
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -40],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      })}
    >
      <Popup>
        <Typography variant="subtitle2">🏁 Destination : {site.nom}</Typography>
        <Typography variant="body2">Lat : {site.lat.toFixed(6)}</Typography>
        <Typography variant="body2">Lng : {site.lng.toFixed(6)}</Typography>
      </Popup>
    </Marker>
  ))}
</MapContainer>
</Box>

        </CardContent>
      </Card>

      {/* Synthèse */}
      <Grid container spacing={2} sx={{ mb: 2, textAlign: 'center' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <DirectionsBusIcon color="primary" fontSize="large" />
              <Typography variant="subtitle1">🚐 Véhicules utilisés</Typography>
              <Typography variant="h5">{totalVehiculesUtilises}</Typography>
            </CardContent>
          </Card>
        </Grid>

      <Grid item xs={12} sm={6} md={3}>
  <Card sx={{ bgcolor: '#f5f5f5' }}>
    <CardContent>
      <BusinessIcon color="action" fontSize="large" />
      <Typography variant="subtitle1">🏢 Sites de destination</Typography>
      <Typography variant="h5">
        {previewResult?.siteById ? Object.keys(previewResult.siteById).length : 0}
      </Typography>
    </CardContent>
  </Card>
</Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <RouteIcon color="action" fontSize="large" />
              <Typography variant="subtitle1">📍 Arrêts (clusters)</Typography>
              <Typography variant="h5">{totalClusters}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <GroupIcon color="error" fontSize="large" />
              <Typography variant="subtitle1">👥 Employés affectés</Typography>
              <Typography variant="h5">{totalEmployes}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>📋 Détails des clusters par groupe</Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Filtrer par groupe"
              variant="outlined"
              size="small"
              value={filterGroupe}
              onChange={(e) => setFilterGroupe(e.target.value)}
            />
            <TextField
              label="Filtrer par site"
              variant="outlined"
              size="small"
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
            />
            <TextField
              label="Filtrer par véhicule"
              variant="outlined"
              size="small"
              value={filterVehicule}
              onChange={(e) => setFilterVehicule(e.target.value)}
            />
                  </Box>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Groupe</TableCell>
                            <TableCell># Cluster</TableCell>
                        <TableCell>Site</TableCell>
                  
                  <TableCell>Immatriculation</TableCell>
                  
                  <TableCell>Distance max (m)</TableCell>
                  <TableCell>Valide</TableCell>
                  <TableCell>Nb Employés</TableCell>
                  <TableCell>Récurrence</TableCell>
                  <TableCell>Planning</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>


              <TableBody>
  {previewResult.groupes.flatMap((groupe) =>
    (previewResult.clustersByGroupe?.[groupe.id] ?? [])
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .filter((cluster) => {
        // ➜ Filtres déjà existants
        const siteNom = previewResult.siteById?.[groupe.site_id]?.nom?.toLowerCase() || '';
        if (filterSite && !siteNom.includes(filterSite.toLowerCase())) return false;
        const vehicule = previewResult.vehiculesDisponibles?.[cluster.vehicule ?? 0];
        const immat = vehicule?.immatriculation?.toLowerCase() || '';
        if (filterVehicule && !immat.includes(filterVehicule.toLowerCase())) return false;
        if (filterGroupe && !groupe.nom.toLowerCase().includes(filterGroupe.toLowerCase())) return false;
        return true;
      })
      .map((cluster, idx) => {
        const vehicule = previewResult.vehiculesDisponibles?.[cluster.vehicule ?? 0];

        return (
          <TableRow
            key={`${groupe.id}-${idx}`}
            sx={cluster.retourFlexible ? { bgcolor: '#f9f9f9' } : {}}
          >
            <TableCell>{groupe.nom}</TableCell>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{previewResult.siteById?.[groupe.site_id]?.nom || '-'}</TableCell>
            <TableCell>{vehicule?.immatriculation || '-'}</TableCell>

            <>
  {cluster.retourFlexible ? (
    <>
      <TableCell colSpan={5}>
        🚐 Retour flexible : {cluster.employes?.length ?? 0} employés affectés
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
    <Button variant="outlined" size="small" onClick={() => handleOpenDialog(cluster, groupe)}>
      Détails
    </Button>
    {/* 🆕 actions ordre */}
    <Button variant="outlined" size="small" onClick={() => onSetOrdre?.(groupe.id, idx, (cluster.ordre ?? (idx+1)) - 1)}>▲</Button>
    <Button variant="outlined" size="small" onClick={() => onSetOrdre?.(groupe.id, idx, (cluster.ordre ?? (idx+1)) + 1)}>▼</Button>
  </Box>
        
      </TableCell>
    </>
  ) : (
    <>
      <TableCell>{cluster.distance_max_m ?? '-'}</TableCell>
      <TableCell>
        {cluster.valide ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
      </TableCell>
      <TableCell>{cluster.employes?.length || 0}</TableCell>
      <TableCell>{groupe.recurrence_type ?? '-'}</TableCell>
      <TableCell>
        <Button variant="outlined" size="small" onClick={() => handleOpenDialog(cluster, groupe)}>
          Détails
        </Button>
      </TableCell>
    </>
  )}
</>

          </TableRow>
        );
      })
  )}
</TableBody>

   
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog détails employés */}
      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  maxWidth="md"
  fullWidth
  // 🆕 le papier ne scrollera pas, il sert juste de conteneur flex
  PaperProps={{
    sx: {
      width: '72vw',
      maxWidth: 980,
      maxHeight: '88vh',
      overflow: 'hidden',          // 🆕 coupe le scroll du Dialog
      display: 'flex',             // 🆕 layout vertical
      flexDirection: 'column'      // 🆕 header / content / actions
    }
  }}
>


        <DialogTitle
        sx={{
    position: 'sticky', top: 0, zIndex: 1,
    bgcolor: 'background.paper',
    borderBottom: '1px solid', borderColor: 'divider'
  }}
        
        
        >
          Détails des employés
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>


        <DialogContent
  dividers
  sx={{
    px: 3, py: 2,
    flex: 1,                 // 🆕 occupe l'espace entre le titre et les actions
    overflow: 'hidden',      // 🆕 pas de scroll ici
    display: 'flex',         // 🆕 on va piloter la liste en flex
    flexDirection: 'column'
  }}
>

           
          {selectedCluster && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Groupe : {selectedCluster.groupe?.nom}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Cluster ordre : {selectedCluster.ordre}
              </Typography>
             <Typography variant="body2" gutterBottom>
                Véhicule : {vehiculesByIndex[selectedCluster.vehicule]?.immatriculation || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Valide : {selectedCluster.valide ? '✅' : '❌'}
              </Typography>
              
<Typography variant="h6" gutterBottom>Employés affectés</Typography>

{/* Filtres : pleine largeur, responsive */}
<Box
  sx={{
    width: '100%',
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
    gap: 1,
    mb: 1,
    alignItems: 'center',
  }}
>
  <TextField
    label="Rechercher (nom, matricule, email)"
    size="small"
    value={q}
    onChange={(e) => setQ(e.target.value)}
    fullWidth
    InputLabelProps={{ shrink: true }}
  />

  <FormControl size="small" fullWidth>
    <InputLabel shrink>Ville</InputLabel>
    <Select
      label="Ville"
      value={filters.ville}
      onChange={(e) => setFilters((f) => ({ ...f, ville: e.target.value as string }))}
      displayEmpty
    >
      <MenuItem value=""><em>Toutes</em></MenuItem>
      {facetOptions.villes.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
    </Select>
  </FormControl>

  <FormControl size="small" fullWidth>
    <InputLabel shrink>Service</InputLabel>
    <Select
      label="Service"
      value={filters.service}
      onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value as string }))}
      displayEmpty
    >
      <MenuItem value=""><em>Tous</em></MenuItem>
      {facetOptions.services.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
    </Select>
  </FormControl>

  <FormControl size="small" fullWidth>
    <InputLabel shrink>Département</InputLabel>
    <Select
      label="Département"
      value={filters.departement}
      onChange={(e) => setFilters((f) => ({ ...f, departement: e.target.value as string }))}
      displayEmpty
    >
      <MenuItem value=""><em>Tous</em></MenuItem>
      {facetOptions.departements.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
    </Select>
  </FormControl>

  <Box sx={{ display: 'flex', alignItems: 'center', pl: { xs: 0, md: 1 } }}>
    <FormControlLabel
      control={
        <Checkbox
          checked={filters.actif}
          onChange={(e) => setFilters((f) => ({ ...f, actif: e.target.checked }))}
        />
      }
      label="Actifs"
    />
  </Box>
</Box>

{/* Résumé & reset */}
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
  <Chip size="small" label={`Résultats: ${filteredEmployees.length}`} />
  <Chip size="small" color="primary" label={`Sélectionnés: ${editedEmployeIds.length}`} />
  <Button size="small" onClick={resetFilters}>Réinitialiser filtres</Button>
</Box>
{/* 🆕 Boutons de sélection de masse (listes filtrées) */}
<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
  <Button variant="outlined" color="primary" onClick={selectAllFiltered}>Tout</Button>
  <Button variant="outlined" color="primary" onClick={selectNoneFiltered}>Rien</Button>
  <Button variant="outlined" color="primary" onClick={invertFiltered}>Inverser</Button>
</Box>

{/* 🆕 Sélections de masse */}
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1,
    mb: 1,
  }}
>
  {/* Sélectionner les résultats filtrés */}
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <Button variant="outlined" color="primary" onClick={selectFilteredForCurrent}>
      Sélectionner résultats filtrés
    </Button>
    <Typography variant="caption" color="text.secondary">
      ({filteredEmployees.length} items)
    </Typography>
  </Box>

  {/* Par rayon (m) */}
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <TextField
      type="number"
      size="small"
      label="Rayon (m)"
      value={radiusM}
      onChange={(e) => setRadiusM(Math.max(0, Number(e.target.value)))}
      InputLabelProps={{ shrink: true }}
      sx={{ width: 120 }}
    />
    <Button variant="outlined" color="primary" onClick={selectByRadiusForCurrent}>
      Par rayon
    </Button>
  </Box>

  {/* Top-K plus proches */}
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <TextField
      type="number"
      size="small"
      label="Top-K"
      value={topK}
      onChange={(e) => setTopK(Math.max(0, Number(e.target.value)))}
      InputLabelProps={{ shrink: true }}
      sx={{ width: 120 }}
    />
    <Button variant="outlined" color="primary" onClick={selectTopKNearestForCurrent}>
      Top-K proches
    </Button>
  </Box>
</Box>

{/* 🆕 Capacité (optionnel) */}
{selectedCluster && (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
    <Typography variant="body2">
      Sélectionnés: <b>{editedEmployeIds.length}</b>
    </Typography>
  </Box>
)}



{/* Liste scrollable SEULEMENT ici */}
<Box sx={{ mt: 1, border: '1px solid #eee', borderRadius: 1, p: 1, flex: 1, minHeight: 0, overflow: 'auto' }}>
  {filteredEmployees.map((emp: any) => {
    const checked = editedEmployeIds.includes(emp.ID);
    return (
      <Box key={emp.ID} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            setEditedEmployeIds((prev) =>
              e.target.checked ? [...prev, emp.ID] : prev.filter(id => id !== emp.ID)
            );
          }}
        />
        <Typography variant="body2">
          {(emp.matricule ?? '')} — {emp.nom} {emp.prenom} · {emp.ville ?? ''} · {emp.service ?? ''} · {emp.departement ?? ''}
        </Typography>
      </Box>
    );
  })}
</Box>

{/* Actions */}
<Box sx={{
    position: 'sticky', bottom: 0, zIndex: 1,
    bgcolor: 'background.paper',
    borderTop: '1px solid', borderColor: 'divider',
    display: 'flex', justifyContent: 'flex-end', gap: 1,
    pt: 1, mt: 2
  }}>
  <Button variant="outlined" size="small" onClick={() => setOpenDialog(false)}>Annuler</Button>
 {/* 🆕 Enregistrer : unicité globale d'affectation */}
    <Button
      variant="contained"
      size="small"
      sx={{ bgcolor: '#228B22', '&:hover': { bgcolor: '#1d741d' } }}
      onClick={() => {
        if (!selectedCluster) return;

        // 1) retrouver l'index du cluster courant (mêmes critères que ton code existant)
        const currentIdx = (previewResult.clustersByGroupe?.[selectedCluster.groupe.id] ?? []).findIndex(
          (c: any) =>
            c.latitude === selectedCluster.latitude &&
            c.longitude === selectedCluster.longitude &&
            c.ordre === selectedCluster.ordre
        );
        if (currentIdx < 0) return;

        // 2) normaliser & dédupliquer la sélection courante
        const chosenIds = Array.from(new Set(editedEmployeIds));

        // 3) retirer ces employés de tous les AUTRES clusters (tous groupes confondus)
        const allGroups = previewResult.clustersByGroupe ?? {};
        Object.entries(allGroups).forEach(([gId, clusters]: [string, any[]]) => {
          clusters.forEach((c: any, idx: number) => {
            // ignorer le cluster courant
            if (gId === selectedCluster.groupe.id && idx === currentIdx) return;

            // normaliser la liste d'IDs du cluster cible
            const currentIds = Array.isArray(c.employes)
              ? c.employes.map((x: any) => (typeof x === 'string' ? x : x?.ID)).filter(Boolean)
              : [];

            // filtrer en retirant les IDs choisis sur le cluster courant
            const filtered = currentIds.filter((id: string) => !chosenIds.includes(id));

            // si changement, pousser la mise à jour vers le parent pour CE cluster
            if (filtered.length !== currentIds.length) {
              onEditEmployes?.(gId, idx, filtered);
            }
          });
        });

        // 4) appliquer la sélection au cluster courant
        onEditEmployes?.(selectedCluster.groupe.id, currentIdx, chosenIds);

        // 5) fermer le dialog
        setOpenDialog(false);
      }}
    >
      Enregistrer
    </Button>
</Box>

  
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
    </ThemeProvider>
  );
};

export default MapPreviewStep;
