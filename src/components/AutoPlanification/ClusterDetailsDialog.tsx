// src/components/autoplanification/ClusterDetailsDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ClusterDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  cluster: any;
  employesByGroupe: Record<string, any[]>;
  vehicules: Array<{ id: string; immatriculation: string }>;
}

export default function ClusterDetailsDialog({
  open,
  onClose,
  cluster,
  employesByGroupe,
  vehicules
}: ClusterDetailsDialogProps) {
  if (!cluster) return null;

  const { groupe, site, cluster: clusterData } = cluster;
  const employeIds = clusterData?.employes || [];
  const employes = employesByGroupe?.[groupe.id]?.filter((e: any) =>
    employeIds.includes(e.ID)
  ) || [];

  const vehiculeMatricule = vehicules?.[clusterData?.vehicule]?.immatriculation ?? `Véhicule #${(clusterData?.vehicule ?? 0) + 1}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Détails du Cluster
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            📌 Groupe : <strong>{groupe.nom}</strong>
          </Typography>
          <Typography variant="body2">
            🏁 Site : {site?.nom ?? 'N/A'}
          </Typography>
          <Typography variant="body2">
            🚐 Véhicule : {vehiculeMatricule}
          </Typography>
          <Typography variant="body2">
            ✅ Valide : {clusterData?.valide ? 'Oui' : 'Non'}
          </Typography>
          <Typography variant="body2">
            📏 Distance max : {clusterData?.distance_max_m ?? 'N/A'} m
          </Typography>
          <Typography variant="body2">
            🗺️ Coordonnées : lat {clusterData?.latitude?.toFixed(6)}, lng {clusterData?.longitude?.toFixed(6)}
          </Typography>
          <Typography variant="body2">
            🔢 Ordre : {clusterData?.ordre + 1}
          </Typography>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          👥 Liste des employés affectés ({employes.length})
        </Typography>
        <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Matricule</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employes.map((emp: any) => (
                <TableRow key={emp.ID}>
                  <TableCell>{emp.matricule}</TableCell>
                  <TableCell>{emp.nom}</TableCell>
                  <TableCell>{emp.prenom}</TableCell>
                  <TableCell>{emp.email ?? '—'}</TableCell>
                  <TableCell>{emp.telephone ?? '—'}</TableCell>
                </TableRow>
              ))}
              {employes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" align="center">
                      Aucun employé affecté.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
