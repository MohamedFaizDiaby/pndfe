import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { TravailleurSignup } from './pages/TravailleurSignup';
import { TravailleurDashboard } from './pages/TravailleurDashboard';
import { AgenceSignup } from './pages/AgenceSignup';
import { AgenceDashboard } from './pages/AgenceDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { QrScanner } from './pages/QrScanner';
import { VerifierQr } from './pages/VerifierQr';
import { NouveauContrat } from './pages/NouveauContrat';
import { ContratDetail } from './pages/ContratDetail';
import { Portefeuille } from './pages/Portefeuille';
import { ListeOffres } from './pages/ListeOffres';
import { OffreDetail } from './pages/OffreDetail';
import { NouvelleOffre } from './pages/NouvelleOffre';
import { CandidaturesOffre } from './pages/CandidaturesOffre';
import { MesCandidatures } from './pages/MesCandidatures';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/travailleur/inscription" element={<TravailleurSignup />} />
        <Route
          path="/travailleur/connexion"
          element={
            <Login
              title="Connexion travailleur"
              expectedRole="TRAVAILLEUR"
              redirectTo="/travailleur/tableau-de-bord"
              registerLink={{ to: '/travailleur/inscription', label: 'Creer mon profil' }}
            />
          }
        />
        <Route
          path="/travailleur/tableau-de-bord"
          element={
            <ProtectedRoute role="TRAVAILLEUR">
              <TravailleurDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travailleur/portefeuille"
          element={
            <ProtectedRoute role="TRAVAILLEUR">
              <Portefeuille />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travailleur/candidatures"
          element={
            <ProtectedRoute role="TRAVAILLEUR">
              <MesCandidatures />
            </ProtectedRoute>
          }
        />

        <Route path="/agence/inscription" element={<AgenceSignup />} />
        <Route
          path="/agence/connexion"
          element={
            <Login
              title="Connexion agence d'emploi"
              expectedRole="AGENCE"
              redirectTo="/agence/tableau-de-bord"
              registerLink={{ to: '/agence/inscription', label: 'Inscrire mon agence' }}
            />
          }
        />
        <Route
          path="/agence/tableau-de-bord"
          element={
            <ProtectedRoute role="AGENCE">
              <AgenceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agence/contrats/nouveau"
          element={
            <ProtectedRoute role="AGENCE">
              <NouveauContrat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contrats/:id"
          element={
            <ProtectedRoute role={['AGENCE', 'TRAVAILLEUR', 'ADMIN']}>
              <ContratDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agence/offres/nouvelle"
          element={
            <ProtectedRoute role="AGENCE">
              <NouvelleOffre />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agence/offres/:id/candidatures"
          element={
            <ProtectedRoute role="AGENCE">
              <CandidaturesOffre />
            </ProtectedRoute>
          }
        />

        <Route path="/offres" element={<ListeOffres />} />
        <Route path="/offres/:id" element={<OffreDetail />} />

        <Route
          path="/admin/connexion"
          element={
            <Login title="Espace Ministere / CNPS" expectedRole="ADMIN" redirectTo="/admin/tableau-de-bord" />
          }
        />
        <Route
          path="/admin/tableau-de-bord"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/scanner" element={<QrScanner />} />
        <Route path="/verifier/:token" element={<VerifierQr />} />
      </Routes>
    </Layout>
  );
}
