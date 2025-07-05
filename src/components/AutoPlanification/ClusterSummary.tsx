// src/components/autoplanification/ClusterSummary.tsx

import { Box, Grid, Paper, Typography } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import FlagIcon from '@mui/icons-material/Flag';

interface ClusterSummaryProps {
  previewResult: any;
  sites: { id: string; lat: number; lng: number; nom: string }[];
}

export default function ClusterSummary({ previewResult, sites }: ClusterSummaryProps) {
  if (!previewResult) return null;

  // Total employés
  const totalEmployes = Object.values(previewResult.employesByGroupe ?? {})
    .flat().length;

  // Total arrêts (clusters)
  const totalArrets = Object.values(previewResult.clustersByGroupe ?? {})
    .reduce((sum, clusters: any) => sum + clusters.length, 0);

  // Véhicules réellement utilisés (index distincts trouvés dans clusters)
  const vehiculesUtilisesIndexes = new Set<number>();
  Object.values(previewResult.clustersByGroupe ?? {}).forEach((clusters: any) =>
    clusters.forEach((c: any) => vehiculesUtilisesIndexes.add(c.vehicule ?? -1))
  );
  const vehiculesUtilisesCount = [...vehiculesUtilisesIndexes].filter(v => v >= 0).length;

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>📊 Synthèse prévisionnelle</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <DirectionsBusIcon fontSize="large" color="primary" />
            <Typography variant="subtitle1">Véhicules utilisés</Typography>
            <Typography variant="h5">{vehiculesUtilisesCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <FlagIcon fontSize="large" color="secondary" />
            <Typography variant="subtitle1">Sites destination</Typography>
            <Typography variant="h5">{sites.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <LocationOnIcon fontSize="large" color="error" />
            <Typography variant="subtitle1">Arrêts (clusters)</Typography>
            <Typography variant="h5">{typeof totalArrets === 'number' ? totalArrets : 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <GroupIcon fontSize="large" color="success" />
            <Typography variant="subtitle1">Employés</Typography>
            <Typography variant="h5">{totalEmployes}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
