//import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from '@mui/material';

type Cluster = {
  id: string;
  groupeId: string;
  nom: string;
  vehicule?: number;
  employes: string[];
  ordre?: number;
};

type Props = {
  clusters: Cluster[];
  onDetailsClick: (clusterId: string) => void;
};

export default function ClusterSummaryTable({ clusters, onDetailsClick }: Props) {
  if (!clusters.length) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        Aucun cluster généré pour cette prévisualisation.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ my: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Groupe</TableCell>
            <TableCell>Cluster</TableCell>
            <TableCell>Véhicule</TableCell>
            <TableCell>Nb Employés</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clusters.map((c, idx) => (
            <TableRow key={idx}>
              <TableCell>{c.groupeId}</TableCell>
              <TableCell>{c.nom}</TableCell>
              <TableCell>{c.vehicule ?? '-'}</TableCell>
              <TableCell>{c.employes?.length ?? 0}</TableCell>
              <TableCell>
                <Button variant="outlined" size="small" onClick={() => onDetailsClick(c.id)}>
                  Voir détails
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
