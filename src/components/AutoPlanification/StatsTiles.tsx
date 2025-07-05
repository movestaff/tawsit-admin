import Grid2 from '@mui/material/Grid'
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type Props = {
  tournees: number;
  arrets: number;
  employes: number;
  vehicules: number;
};

export default function StatsTiles({ tournees, arrets, employes, vehicules }: Props) {
  return (
    <Grid2 container spacing={2} sx={{ my: 2 }}>
      <Grid2 item xs={12} sm={6} md={3}>
        
      </Grid2>
      <Grid2 item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">📍 Arrêts</Typography>
          <Typography variant="h4">{arrets}</Typography>
        </Paper>
      </Grid2>
      <Grid2 item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">👥 Employés</Typography>
          <Typography variant="h4">{employes}</Typography>
        </Paper>
      </Grid2>
      <Grid2 item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">🚐 Véhicules</Typography>
          <Typography variant="h4">{vehicules}</Typography>
        </Paper>
      </Grid2>
    </Grid2>
  );
}
