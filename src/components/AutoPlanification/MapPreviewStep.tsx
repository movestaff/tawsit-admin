
// src/components/AutoPlanification/MapPreviewStep.tsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, IconButton, TextField
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GroupIcon from '@mui/icons-material/Group';
import RouteIcon from '@mui/icons-material/Route';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import L from 'leaflet';
import BusinessIcon from '@mui/icons-material/Business';

import 'leaflet/dist/leaflet.css';

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
};

  const MapPreviewStep: React.FC<Props> = ({ previewResult }) => {

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
    setOpenDialog(true);
  };
  const vehiculesByIndex = (previewResult.vehiculesDisponibles ?? []).reduce((acc, v, idx) => {
  acc[idx] = v;
  return acc;
}, {} as Record<number, Vehicule>);

  const [filterGroupe, setFilterGroupe] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterVehicule, setFilterVehicule] = useState('');

  return (
    <Box p={2}>
      {/* Carte */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
         
          <MapContainer center={[avgLat, avgLng]} zoom={12} style={{ height: '400px', width: '100%' }}>
  <TileLayer
    attribution='&copy; OpenStreetMap contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  {/* Affichage des clusters de type DEPART uniquement (exclusion des retours flexibles) */}
  {previewResult.groupes.map((groupe) =>
    (previewResult.clustersByGroupe?.[groupe.id] ?? [])
      .filter(c => !c.retourFlexible)
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map((c, idx) => (
        <Marker
          key={`${groupe.id}-${idx}`}
          position={[c.latitude, c.longitude]}
          icon={customIcon}
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
          </Popup>
        </Marker>
      ))
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
        <Button variant="outlined" size="small" onClick={() => handleOpenDialog(cluster, groupe)}>
          Détails
        </Button>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Détails des employés
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
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
              <Typography variant="h6" gutterBottom>
                Employés affectés
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
               <ul>
  {(selectedCluster.employes || []).map((emp: any, index: number) => {
    // Cas retourFlexible : c'est déjà l'objet complet
    if (selectedCluster.retourFlexible) {
      return (
        <li key={emp.ID ?? index}>
          {emp.matricule ?? ''} - {emp.nom} {emp.prenom} ({emp.email ?? ''}) ({emp.telephone ?? ''})
        </li>
      );
    }

    // Cas DEPART : ids simples -> lookup
    const employe = Object.values(previewResult.employesByGroupe || {})
      .flat()
      .find((e): e is Employe => (e as Employe).ID === emp);

    return (
      <li key={emp}>
        {employe
          ? `${employe.matricule ?? ''} - ${employe.nom} ${employe.prenom} (${employe.email ?? ''}) (${employe.telephone ?? ''})`
          : emp}
      </li>
    );
  })}
</ul>

              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MapPreviewStep;
