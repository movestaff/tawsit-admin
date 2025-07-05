// src/components/autoplanification/ClusterTableModal.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClusterDetailsDialog from './ClusterDetailsDialog';

interface ClusterTableModalProps {
  open: boolean;
  onClose: () => void;
  previewResult: any;
  sites: { id: string; lat: number; lng: number; nom: string }[];
  onShowDetails: (groupeId: string, clusterIndex: number) => void;
}


export default function ClusterTableModal({
  open,
  onClose,
  previewResult,
  sites
}: ClusterTableModalProps) {
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [filters, setFilters] = useState({ groupe: '', site: '', vehicule: '' });

  if (!previewResult) return null;

  const groupes = previewResult.groupes || [];
  const clustersByGroupe = previewResult.clustersByGroupe || {};
  const employesByGroupe = previewResult.employesByGroupe || {};
  const vehicules = previewResult.vehiculesDisponibles || [];
  const siteById = previewResult.siteById || {};

  const vehiculeLabel = (vehiculeIdx: number) => {
    const vehId = vehicules[vehiculeIdx]?.id;
    return vehicules.find((v: any) => v.id === vehId)?.immatriculation ?? `Vehicule #${vehiculeIdx + 1}`;
  };

  type FilteredRow = {
    groupe: any;
    site: any;
    cluster: any;
    clusterIndex: number;
    nbEmployes: number;
  };

  const filteredRows: FilteredRow[] = groupes.flatMap((groupe: any) => {
    const site = siteById[groupe.site_id];
    const clusters = clustersByGroupe[groupe.id] || [];
    return clusters
      .filter((c: any) => {
        if (filters.vehicule && `${c.vehicule}` !== filters.vehicule) return false;
        if (filters.groupe && groupe.nom !== filters.groupe) return false;
        if (filters.site && site?.nom !== filters.site) return false;
        return true;
      })
      .map((c: any, idx: number) => ({
        groupe,
        site,
        cluster: c,
        clusterIndex: idx + 1,
        nbEmployes: c.employes?.length ?? 0
      }));
  });

  const handleOpenDetails = (row: any) => setSelectedCluster(row);
  const handleCloseDetails = () => setSelectedCluster(null);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          Détails des clusters par groupe
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Filtrer par Groupe"
              variant="outlined"
              size="small"
              value={filters.groupe}
              onChange={(e) => setFilters({ ...filters, groupe: e.target.value })}
            />
            <TextField
              label="Filtrer par Site"
              variant="outlined"
              size="small"
              value={filters.site}
              onChange={(e) => setFilters({ ...filters, site: e.target.value })}
            />
            <TextField
              label="Filtrer par Véhicule"
              variant="outlined"
              size="small"
              value={filters.vehicule}
              onChange={(e) => setFilters({ ...filters, vehicule: e.target.value })}
            />
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Groupe</TableCell>
                <TableCell>Site</TableCell>
                <TableCell>Cluster</TableCell>
                <TableCell>Distance max (m)</TableCell>
                <TableCell>Valide</TableCell>
                <TableCell>Nb Employés</TableCell>
                <TableCell>Récurrence</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row: FilteredRow, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{row.groupe.nom}</TableCell>
                  <TableCell>{row.site?.nom ?? 'N/A'}</TableCell>
                  <TableCell>{row.clusterIndex}</TableCell>
                  <TableCell>{row.cluster.distance_max_m ?? 'N/A'}</TableCell>
                  <TableCell>{row.cluster.valide ? '✅' : '❌'}</TableCell>
                  <TableCell>{row.nbEmployes}</TableCell>
                  <TableCell>
                    {row.groupe.recurrence_type === 'unique' && (
                      <Typography variant="body2">
                        Unique : {row.groupe.date_unique}
                      </Typography>
                    )}
                    {row.groupe.recurrence_type === 'hebdomadaire' && (
                      <Typography variant="body2">
                        Hebdo : {row.groupe.jours_semaine?.join(', ')}
                      </Typography>
                    )}
                    {row.groupe.recurrence_type === 'mensuel' && (
                      <Typography variant="body2">
                        Mensuel : {row.groupe.jours_mois?.join(', ')}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {row.groupe.heure_debut} - {row.groupe.heure_fin}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleOpenDetails(row)}>
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRows.length === 0 && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Aucun résultat avec ces filtres.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <ClusterDetailsDialog
        open={!!selectedCluster}
        onClose={handleCloseDetails}
        cluster={selectedCluster}
        employesByGroupe={employesByGroupe}
        vehicules={vehicules}
      />
    </>
  );
}
