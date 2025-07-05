// src/components/AutoPlanification/MapPreviewStep.ts
import { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Dialog } from '@mui/material';
import ClusterSummary from './ClusterSummary';
import CarteClusters from './CarteClusters';
import ClusterTableModal from '../AutoPlanification/ClusterTableModal';
import ClusterDetailsDialog from './ClusterDetailsDialog';

interface Props {
  previewResult: any;
}

export default function MapPreviewStep({ previewResult }: Props) {
  const [openTable, setOpenTable] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<{
    groupeId: string;
    clusterIndex: number;
  } | null>(null);

  // Sites sous forme de liste
  const sitesArray = useMemo(() => {
    if (!previewResult?.siteById) return [];
    return Object.entries(previewResult.siteById).map(([id, s]) => {
      const site = s as { lat: number; lng: number; nom: string };
      return {
        id,
        lat: site.lat,
        lng: site.lng,
        nom: site.nom,
      };
    });
  }, [previewResult]);

  // Données employes
  const employesByGroupe = useMemo(() => previewResult?.employesByGroupe || {}, [previewResult]);

  return (
    <Box>
      {/* 1️⃣ Carte */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🗺️ Carte des arrêts et sites de destination
          </Typography>
          <CarteClusters
            clustersByGroupe={previewResult?.clustersByGroupe}
            sites={sitesArray}
            previewResult={previewResult}
            onSelectCluster={({ groupeId, clusterIndex }: { groupeId: string; clusterIndex: number }) =>
              setSelectedCluster({ groupeId, clusterIndex })
            }
          />
        </CardContent>
      </Card>

      {/* 2️⃣ Synthèse */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <ClusterSummary previewResult={previewResult} sites={sitesArray} />
        </CardContent>
      </Card>

      {/* 3️⃣ Bouton pour ouvrir la table modale */}
      <Box textAlign="center" sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setOpenTable(true)}>
          📋 Voir détails des clusters
        </Button>
      </Box>

      {/* 4️⃣ Table modale */}
      <Dialog
        open={openTable}
        onClose={() => setOpenTable(false)}
        fullWidth
        maxWidth="lg"
      >
        <ClusterTableModal
          open={openTable}
          previewResult={previewResult}
          sites={sitesArray}
          onShowDetails={(groupeId: string, clusterIndex: number) =>
            setSelectedCluster({ groupeId, clusterIndex })
          }
          onClose={() => setOpenTable(false)}
        />
      </Dialog>

      {/* 5️⃣ Dialog détails employés */}
      <ClusterDetailsDialog
        open={!!selectedCluster}
        onClose={() => setSelectedCluster(null)}
        employesByGroupe={employesByGroupe}
        cluster={
          selectedCluster
            ? previewResult?.clustersByGroupe?.[selectedCluster.groupeId]?.[selectedCluster.clusterIndex]
            : undefined
        }
        vehicules={
          selectedCluster
            ? previewResult?.vehiculesByGroupe?.[selectedCluster.groupeId]
            : undefined
        }
      />
    </Box>
  );
}
