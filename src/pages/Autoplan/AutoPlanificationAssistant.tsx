import { useState, Suspense } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { lazy } from 'react';

const GroupeSelector = lazy(() => import('../../components/AutoPlanification/GroupeSelector'));
const VehiculeSelector = lazy(() => import('../../components/AutoPlanification/VehiculeSelector'));
const DateSelector = lazy(() => import('../../components/AutoPlanification/DateSelector'));
const MapPreviewStep = lazy(() => import('../../components/AutoPlanification/MapPreviewStep'));
const ClusterDetailsModal = lazy(() => import('../../components/AutoPlanification/ClusterDetailsModal'));
const PlanificationResult = lazy(() => import('../../components/AutoPlanification/PlanificationResult'));

import { previewAutoPlan, confirmAutoPlan } from '../../lib/api';

const steps = [
  'Sélection des groupes',
  'Sélection des véhicules',
  'Choix de la date',
  'Prévisualisation',
  'Confirmation'
];

export type Arret = {
  ID: string;
  tournee_id: string;
  nom: string;
  latitude: number;
  longitude: number;
  ordre: number;
  societe_id: string;
  adresse?: string | null;
};


export default function AutoPlanificationAssistant() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedGroupes, setSelectedGroupes] = useState<string[]>([]);
  const [selectedVehicules, setSelectedVehicules] = useState<any[]>([]);
  const [dateReference, setDateReference] = useState<Date | null>(new Date());

  const [previewResult, setPreviewResult] = useState<any>(null);
  const [finalResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // 👉 Helpers
  const flattenClusters = (clustersByGroupe: any) =>
    Object.entries(clustersByGroupe).flatMap(([groupeId, clusters]) =>
      (clusters as any[]).map((c: any) => ({ ...c, groupeId }))
    );

  const findCluster = (id: string | null) =>
    id ? flattenClusters(previewResult?.clustersByGroupe || {}).find(c => c.id === id) : null;

  

  // 👉 Navigation
  const handleNext = () => {
    if (activeStep === 0 && selectedGroupes.length === 0) {
      toast.error("❌ Veuillez sélectionner au moins un groupe !");
      return;
    }
    if (activeStep === 1 && selectedVehicules.length === 0) {
      toast.error("❌ Veuillez sélectionner au moins un véhicule !");
      return;
    }
    if (activeStep === 2 && !dateReference) {
      toast.error("❌ Veuillez choisir une date !");
      return;
    }

    if (activeStep === 2) {
      // ➜ Lancer la prévisualisation
      handlePreview();
      return;
    }

    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0));

  // 👉 API
  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await previewAutoPlan({
        groupe_ids: selectedGroupes,
         vehicule_ids: selectedVehicules.map(v => v.id),
        date_reference: dateReference?.toISOString().split('T')[0]
      });
      setPreviewResult(res);
      toast.success("✅ Calcul de la planification réussi !");
      setActiveStep(prev => prev + 1);
    } catch (e: any) {
      console.error(e);
      toast.error("❌ Erreur lors du calcul : " + e.message);
    } finally {
      setLoading(false);
    }
  };

 const handleConfirm = async () => {
  if (!previewResult) {
    toast.error('❌ Données de prévisualisation manquantes !');
    return;
  }

  // Vérification des champs nécessaires
  const {
    date_reference,
    groupes,
    clustersByGroupe,
    employesByGroupe,
    vehiculesDisponibles,
    conducteursActifs,
    siteById
  } = previewResult;

  if (
    !clustersByGroupe ||
    !groupes ||
    groupes.length === 0 ||
    !vehiculesDisponibles ||
    !conducteursActifs ||
    !siteById
  ) {
    toast.error('❌ Données manquantes ou incomplètes pour confirmer !');
    return;
  }

  // Construction du payload
  const payload = {
    dateReference: date_reference,
    groupes: groupes.map((g: any) => ({
      id: g.id,
      nom: g.nom,
      heure_debut: g.heure_debut,
      heure_fin: g.heure_fin,
      recurrence_type: g.recurrence_type,
      date_unique: g.date_unique,
      jours_semaine: g.jours_semaine,
      jours_mois: g.jours_mois,
      site_id: g.site_id,
      type: g.type
    })),
    clustersByGroupe,
    employesByGroupe,
    vehiculesDisponibles,
    conducteursActifs,
    siteById
  };

  try {
    setLoading(true);
    await confirmAutoPlan(payload);
    toast.success('✅ Planification confirmée et sauvegardée !');
    setActiveStep(prev => prev + 1);
  } catch (error) {
    console.error('Erreur lors de la confirmation :', error);
    toast.error('❌ Erreur lors de la confirmation de la planification.');
  } finally {
    setLoading(false);
  }
};



  // 👉 Rendu
  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Assistant de planification automatique
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 2 }}>
        {loading && (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <Suspense fallback={<CircularProgress />}>
            {activeStep === 0 && (<GroupeSelector selected={selectedGroupes} onChange={setSelectedGroupes} active={activeStep === 0} /> )}

            {activeStep === 1 && (
              <VehiculeSelector
                selected={selectedVehicules}
                onChange={setSelectedVehicules}
                active={activeStep === 1}
              />
            )}

            {activeStep === 2 && (<DateSelector dateReference={dateReference ? dateReference.toISOString().split('T')[0] : ''}
                onChange={(dateStr: string) => {
                setDateReference(dateStr ? new Date(dateStr) : null);}}/>)}

            {activeStep === 3 && previewResult && (<> <Typography variant="h6" gutterBottom>🗺️ Carte des Arrêts Prévisionnels</Typography>
                <MapPreviewStep previewResult={previewResult} />
                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  color="success"
                  sx={{ mt: 2 }}>
                  ✅ Confirmer la planification
                </Button> <ClusterDetailsModal
                  open={!!selectedClusterId}
                  cluster={findCluster(selectedClusterId)}
                  onClose={() => setSelectedClusterId(null)}/> </>  )}

            {activeStep === 4 && finalResult && ( <PlanificationResult result={finalResult} onRestart={() => window.location.reload()} /> )} 
            </Suspense>
        )}
          
          </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                 Retour
                </Button>
            {activeStep < steps.length - 1 && (
                <Button variant="contained" onClick={handleNext}>
                  {activeStep === 2 ? 'Lancer la prévisualisation' : 'Suivant'}
                </Button>
        )}
            </Box>
            </Box>
  );
}
