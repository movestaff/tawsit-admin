//import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PlaceIcon from '@mui/icons-material/Place';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

type Props = {
  result: any;
  onRestart?: () => void;
};

export default function PlanificationResult({ result, onRestart }: Props) {
  if (!result) return null;

  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
      <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
        ✅ Planification confirmée et enregistrée
      </Typography>
      
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Stack direction="column" spacing={1} alignItems="center">
              <PlaceIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Arrêts</Typography>
              <Typography variant="h4">{result.arrets?.length ?? 0}</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Stack direction="column" spacing={1} alignItems="center">
              <GroupIcon color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Affectations Employés</Typography>
              <Typography variant="h4">{result.affectationsEmployes?.length ?? 0}</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Stack direction="column" spacing={1} alignItems="center">
              <PersonIcon color="warning" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Conducteurs assignés</Typography>
              <Typography variant="h4">{result.affectationsConducteurs?.length ?? 0}</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {onRestart && (
        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 4 }}
          onClick={onRestart}
        >
          🔁 Nouvelle planification
        </Button>
      )}
    </Paper>
  );
}
