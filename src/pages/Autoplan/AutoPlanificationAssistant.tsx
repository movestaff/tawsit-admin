import { useState, Suspense } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { toast } from 'react-toastify';
import { lazy } from 'react';
import Check from '@mui/icons-material/Check';
import type { StepIconProps } from '@mui/material/StepIcon';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button';
import {
  previewAutoPlan,
  confirmAutoPlan,
  fetchVehiculesDisponiblesPourPlanning
} from '../../lib/api';

const ForestGreen = '#228B22';




const CustomStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ ownerState }) => ({
    backgroundColor: ownerState.active || ownerState.completed ? ForestGreen : '#ccc',
    color: '#fff',
    display: 'flex',
    height: 36,
    width: 36,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  })
);

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, className, icon } = props;
  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? <Check style={{ fontSize: 20, color: '#fff' }} /> : icon}
    </CustomStepIconRoot>
  );
}

const GroupeSelector = lazy(() => import('../../components/AutoPlanification/GroupeSelector'));
const VehiculeSelector = lazy(() => import('../../components/AutoPlanification/VehiculeSelector'));
const DateSelector = lazy(() => import('../../components/AutoPlanification/DateSelector'));
const MapPreviewStep = lazy(() => import('../../components/AutoPlanification/MapPreviewStep'));
const ClusterDetailsModal = lazy(() => import('../../components/AutoPlanification/ClusterDetailsModal'));

const steps = [
  'Sélection des groupes',
  'Sélection des véhicules',
  'Choix de la date',
  'Prévisualisation',
  'Confirmation'
];

export default function AutoPlanificationAssistant() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedGroupes, setSelectedGroupes] = useState<string[]>([]);
  const [selectedVehicules, setSelectedVehicules] = useState<any[]>([]);
  const [vehiculesDisponibles, setVehiculesDisponibles] = useState<any[]>([]);

  const [dateReference, setDateReference] = useState<Date | null>(new Date());
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [planificationType, setPlanificationType] = useState<'depart' | 'retour'>('depart');

  // 🆕 Helpers d'édition (mutations immuables sur previewResult)
const updateClusterAt = (groupeId: string, clusterIdx: number, patch: any) => {
  setPreviewResult((prev: any) => {
    if (!prev?.clustersByGroupe?.[groupeId]) return prev;
    const next = { ...prev };
    next.clustersByGroupe = { ...prev.clustersByGroupe };
    const arr = [...prev.clustersByGroupe[groupeId]];
    arr[clusterIdx] = { ...arr[clusterIdx], ...patch };
    next.clustersByGroupe[groupeId] = arr;
    return next;
  });
};

// 🆕 1) Déplacer un marker (maj lat/lng)
const handleMoveMarker = (groupeId: string, clusterIdx: number, lat: number, lng: number) => {
  updateClusterAt(groupeId, clusterIdx, { latitude: lat, longitude: lng });
};

// 🆕 2) Modifier l'ordre (1-based) + renumérotation propre
const handleSetOrdre = (groupeId: string, clusterIdx: number, newOrdre: number) => {
  setPreviewResult((prev: any) => {
    const arr = prev?.clustersByGroupe?.[groupeId];
    if (!arr) return prev;

    // copie
    const next = { ...prev, clustersByGroupe: { ...prev.clustersByGroupe } };
    const cloned = arr.map((c: any) => ({ ...c }));

    // borne 1..N
    const N = cloned.length;
    const target = Math.max(1, Math.min(N, Math.trunc(newOrdre)));

    // récupérer l’ordre actuel
    const current = cloned[clusterIdx]?.ordre ?? (clusterIdx + 1);

    if (target === current) return prev;

    // décaler les autres
    cloned.forEach((c: any, i: number) => {
      const o = c.ordre ?? (i + 1);
      if (i === clusterIdx) return;
      if (o >= target && o < current) c.ordre = o + 1;
      if (o <= target && o > current) c.ordre = o - 1;
    });

    // positionner le nouveau
    cloned[clusterIdx].ordre = target;

    // normaliser 1..N (sécurité)
    const sorted = cloned
      .sort((a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map((c: any, i: number) => ({ ...c, ordre: i + 1 }));

    next.clustersByGroupe[groupeId] = sorted;
    return next;
  });
};

// 🆕 3) Modifier les employés affectés (tableau d'IDs)
const handleEditEmployes = (groupeId: string, clusterIdx: number, employeIds: string[]) => {
  updateClusterAt(groupeId, clusterIdx, { employes: employeIds });
};

  /** ✅ Nouvelle étape : filtrer véhicules disponibles */
  const handleFetchVehiculesDisponibles = async () => {
    if (!selectedGroupes.length || !dateReference) {
      toast.error("❌ Veuillez d'abord sélectionner les groupes et la date !");
      return false;
    }

    try {
      setLoading(true);
      const planning = {
        date: dateReference.toISOString().split('T')[0],
        // Tu peux enrichir avec la récurrence/horaires si tu les as côté frontend
        heure_debut: '08:00',
        heure_fin: '09:00',
        recurrence_type: 'unique',
      };

      const res = await fetchVehiculesDisponiblesPourPlanning(planning);

      if (!res.vehiculesDisponibles?.length) {
        toast.error("❌ Aucun véhicule avec conducteur disponible pour ce créneau.");
        return false;
      }

      setVehiculesDisponibles(res.vehiculesDisponibles);
      toast.success(`✅ ${res.vehiculesDisponibles.length} véhicules trouvés`);
      return true;

    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'Erreur serveur');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /** Navigation */
  const handleNext = async () => {
    if (activeStep === 0) {
      if (selectedGroupes.length === 0) {
        toast.error("❌ Veuillez sélectionner au moins un groupe !");
        return;
      }
      const ok = await handleFetchVehiculesDisponibles();
      if (!ok) return;
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
      handlePreview();
      return;
    }

    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0));

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
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
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

    const {
      date_reference,
      groupes,
      clustersByGroupe,
      employesByGroupe,
      vehiculesDisponibles,
      conducteursActifs,
      siteById
    } = previewResult;

    if (!clustersByGroupe || !groupes || groupes.length === 0 || !vehiculesDisponibles || !conducteursActifs || !siteById) {
      toast.error('❌ Données manquantes ou incomplètes pour confirmer !');
      return;
    }

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
      setFinalResult(previewResult);
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    } catch (error: any) {
      console.error('Erreur lors de la confirmation :', error);
      toast.error(`❌ Erreur lors de la confirmation : ${error?.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Sites de destination pour résumé
  const siteNoms = finalResult?.groupes
    ? Array.from(
        new Set(
          finalResult.groupes
            .map((g: any) => finalResult.siteById?.[g.site_id]?.nom)
            .filter((n: string | undefined) => n)
        )
      )
    : [];

  return (
    
    <Box sx={{ maxWidth: 1600, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Assistant de planification par IA
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
  <Typography variant="h6">🎯 Type de planification</Typography>
  <RadioGroup
    row
    value={planificationType}
    onChange={(e) => setPlanificationType(e.target.value as 'depart' | 'retour')}
  >
    <FormControlLabel value="depart" control={<Radio />} label="Aller (avec arrêts optimisés)" />
    <FormControlLabel value="retour" control={<Radio />} label="Retour (flexible sans arrêts)" />
  </RadioGroup>
</Paper>


      <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
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
            {activeStep === 0 && (
              <GroupeSelector
              planificationType={planificationType}
                selected={selectedGroupes}
                onChange={setSelectedGroupes}
                active={activeStep === 0}
              />
            )}

            {activeStep === 1 && (
              <VehiculeSelector
                selected={selectedVehicules}
                onChange={setSelectedVehicules}
                active={activeStep === 1}
                vehiculesDisponibles={vehiculesDisponibles}
              />
            )}

            {activeStep === 2 && (
              <DateSelector
                dateReference={dateReference ? dateReference.toISOString().split('T')[0] : ''}
                onChange={(dateStr: string) => {
                  setDateReference(dateStr ? new Date(dateStr) : null);
                }}
              />
            )}

            {activeStep === 3 && previewResult && (
              <>
                <Typography variant="h6" gutterBottom>
                  🗺️ Carte des Arrêts Prévisionnels
                </Typography>
                <MapPreviewStep
                  previewResult={previewResult}
                  // 🆕 callbacks d'édition
                  onMoveMarker={handleMoveMarker}
                  onSetOrdre={handleSetOrdre}
                  onEditEmployes={handleEditEmployes}
/>
              </>
            )}

            {activeStep === 4 && finalResult && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  ✅ Planification créée avec succès
                </Typography>

                <Paper className="p-4 my-4 bg-secondary border border-primary rounded">
                  <Typography variant="subtitle1" className="text-primary mb-2">
                    📋 Résumé de la planification
                  </Typography>

                  <ul className="list-disc list-inside text-sm text-gray-800">
                    <li><strong>Date :</strong> {finalResult.date_reference}</li>
                    <li><strong>Groupes :</strong> {finalResult.groupes?.map((g: any) => g.nom).join(', ') || '-'}</li>
                    <li><strong>Sites de destination :</strong> {siteNoms.length > 0 ? siteNoms.join(', ') : '-'}</li>
                    <li><strong>Véhicules utilisés :</strong> {finalResult.vehiculesDisponibles?.map((v: any) => v.immatriculation).join(', ') || '-'}</li>
                    <li><strong>Nombre d'employés planifiés :</strong> {
                      (Object.values(finalResult.employesByGroupe || {}) as any[][]).reduce(
                        (acc, employes) => acc + employes.length, 0
                      )
                    }</li>
                  </ul>
                </Paper>

                <Box className="flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    className="mt-4"
                    onClick={() => navigate('/planification')}
                  >
                    🔎 Consulter dans les planifications
                  </Button>
                </Box>
              </Box>
            )}
          </Suspense>
        )}
      </Paper>

      {activeStep < 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outline"
            size="md"
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            ◀ Retour
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
          >
            {activeStep === 2 ? 'Lancer la prévisualisation ▶' : 'Suivant ▶'}
          </Button>
        </Box>
      )}

      {activeStep === 3 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
          >
            ◀ Retour
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
          >
            ✅ Confirmer la planification
          </Button>
        </Box>
      )}
    </Box>
  );
}

