// ✅ src/App.tsx

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Suspense, lazy } from 'react';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import AuthLinkHandler from './components/AuthLinkHandler'
import RequirePasswordChange from './components/RequirePasswordChange' 





// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SelectSocietePage = lazy(() => import('./pages/SelectSocietePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Carte = lazy(() => import('./pages/Carte'));
const Tournees = lazy(() => import('./pages/Tournees'));
const Parametres = lazy(() => import('./pages/parametres'));
const Employes = lazy(() => import('./pages/Employes'));
const Conducteurs = lazy(() => import('./pages/Conducteurs'));
const Planification = lazy(() => import('./pages/Planification'));
const Calendrier = lazy(() => import('./pages/Calendrier'));
const Sites = lazy(() => import('./pages/sites'));
const GroupeEmployes = lazy(() => import('./pages/GroupeEmployes'));
const Vehicules = lazy(() => import('./pages/Vehicules'));
const Contrats = lazy(() => import('./pages/Contrats'));
const Paiement = lazy(() => import('./pages/facturation/PaiementsPage'));
const Facturation = lazy(() => import('./pages/facturation/Facturation'));
const AutoPlanificationAssistant = lazy(() => import('./pages/Autoplan/AutoPlanificationAssistant'));
const Prestataires = lazy(() => import('./pages/Prestataires'));
const PlanificationCalendrier = lazy(() => import('./pages/PlanificationCalendrier'));
const ListeExecutionsTournees = lazy(() => import ('./pages/ListeExecutionsTournees'));
const GestionTournee = lazy(() => import ('./pages/GestionTournee'));
const TooltipTest = lazy(() => import('./components/ui/TooltipTest'));
const IAPropositions = lazy(() => import('./pages/IAPropositions'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ConfigurationSysteme = lazy(() => import('./pages/ConfigurationSysteme'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'))




function App() {

  const { initAuthListener, checkSession, logout } = useAuthStore();

  useEffect(() => {
  checkSession();
  initAuthListener();

  const interval = setInterval(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      logout();
      console.warn('⚠️ Session expirée : utilisateur déconnecté automatiquement.');
    }
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, [initAuthListener, checkSession, logout]);

  
  return (
    <BrowserRouter>
      <AuthLinkHandler />
      <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '2rem' }}>Chargement...</div>}>
        <Routes>
          {/* Page de login SANS layout */}
          <Route path="/" element={<LoginPage />} />

           <Route path="/auth/callback" element={<AuthCallback />} />
           <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Pages internes AVEC layout */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  
                <RequirePasswordChange> {/* 🔒 CHANGE (ouverture) */}
                  <Routes>
                    <Route path="/select-societe" element={<SelectSocietePage />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="carte" element={<Carte />} />
                    <Route path="tournees" element={<Tournees />} />
                    <Route path="parametres" element={<Parametres />} />
                    <Route path="employes" element={<Employes />} />
                    <Route path="conducteurs" element={<Conducteurs />} />
                    <Route path="planification" element={<Planification />} />
                    <Route path="calendrier" element={<Calendrier />} />
                    <Route path="sites" element={<Sites />} />
                    <Route path="GroupeEmployes" element={<GroupeEmployes />} />
                    <Route path="Vehicules" element={<Vehicules />} />
                    <Route path="contrats" element={<Contrats />} />
                    <Route path="paiements" element={<Paiement />} />
                    <Route path="facturation" element={<Facturation />} />
                    <Route path="assistant-planification" element={<AutoPlanificationAssistant />} />
                    <Route path="prestataires" element={<Prestataires />} />
                    <Route path="planificationcalendrier" element={<PlanificationCalendrier />} />
                    <Route path="listeExecutionstournees" element={<ListeExecutionsTournees />} />
                    <Route path="gestion-tournee" element={<GestionTournee />} />
                    <Route path="tooltip-test" element={<TooltipTest />} />
                    <Route path="/ia/propositions" element={<IAPropositions />} />
                    
                    <Route path="/configuration-systeme" element={<ConfigurationSysteme />} />

                  </Routes>
                  </RequirePasswordChange> {/* 🔒 CHANGE (fermeture) */}
                </DashboardLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
