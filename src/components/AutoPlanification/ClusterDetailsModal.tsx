//import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Cluster = {
  id: string;
  nom: string;
  vehicule?: number;
  ordre?: number;
  employes: any[];
};

type Props = {
  open: boolean;
  cluster: Cluster | null;
  onClose: () => void;
};

export default function ClusterDetailsModal({ open, cluster, onClose }: Props) {
  if (!cluster) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Détails du Cluster
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1">Nom : {cluster.nom}</Typography>
        <Typography variant="subtitle2">Véhicule assigné : {cluster.vehicule ?? 'Non assigné'}</Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">👥 Employés affectés</Typography>
        <List dense>
          {cluster.employes.map((emp: any, idx: number) => (
            <ListItem key={idx}>
              <ListItemText primary={`${emp.nom} ${emp.prenom}`} secondary={emp.email} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
