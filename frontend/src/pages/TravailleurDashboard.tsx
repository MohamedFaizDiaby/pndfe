import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fileUrl } from '../api/client';

interface TravailleurProfile {
  nom: string;
  prenoms: string;
  metier: string;
  telephone: string;
  numeroPieceIdentite: string;
  photoUrl: string | null;
  statutVerification: string;
  qrCodeDataUrl: string;
  createdAt: string;
}

interface Contrat {
  id: string;
  poste: string;
  typeContrat: string;
  statut: string;
  salaireBrut: number;
  agence: { raisonSociale: string };
  createdAt: string;
}

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: 'Verification en attente', className: 'orange' },
  VERIFIE: { label: 'Identite verifiee', className: 'green' },
  REJETE: { label: 'Identite rejetee', className: 'red' },
};

const CONTRAT_STATUT_LABEL: Record<string, { label: string; className: string }> = {
  ENVOYE: { label: 'A signer', className: 'orange' },
  SIGNE: { label: 'Signe', className: 'green' },
  REFUSE: { label: 'Refuse', className: 'red' },
};

export function TravailleurDashboard() {
  const [profile, setProfile] = useState<TravailleurProfile | null>(null);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/travailleurs/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Impossible de charger votre profil'));
    api
      .get('/travailleurs/contrats')
      .then((res) => setContrats(res.data))
      .catch(() => {});
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!profile) return <p>Chargement de votre profil...</p>;

  const statut = STATUT_LABEL[profile.statutVerification] || STATUT_LABEL.EN_ATTENTE;

  return (
    <div>
      <div className="card">
        <h2>
          {profile.prenoms} {profile.nom}
        </h2>
        <span className={`badge ${statut.className}`}>{statut.label}</span>
        <table style={{ marginTop: 16 }}>
          <tbody>
            <tr><th>Metier</th><td>{profile.metier}</td></tr>
            <tr><th>Telephone</th><td>{profile.telephone}</td></tr>
            <tr><th>Piece d'identite</th><td>{profile.numeroPieceIdentite}</td></tr>
            <tr><th>Membre depuis</th><td>{new Date(profile.createdAt).toLocaleDateString('fr-FR')}</td></tr>
          </tbody>
        </table>
        {profile.photoUrl && (
          <img
            src={fileUrl(profile.photoUrl)}
            alt="Photo de profil"
            style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '50%', marginTop: 14 }}
          />
        )}
      </div>

      <div className="card qr-card">
        <h2>Ma carte professionnelle</h2>
        <p style={{ color: 'var(--muted)' }}>
          Presentez ce QR Code a une agence ou un employeur pour prouver votre identite instantanement.
        </p>
        <img src={profile.qrCodeDataUrl} alt="QR Code professionnel" />
      </div>

      <div className="card">
        <h2>Mes contrats</h2>
        {contrats.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Vous n'avez pas encore recu de contrat.</p>
        ) : (
          contrats.map((c) => {
            const cs = CONTRAT_STATUT_LABEL[c.statut] || CONTRAT_STATUT_LABEL.ENVOYE;
            return (
              <Link
                key={c.id}
                to={`/contrats/${c.id}`}
                className="card"
                style={{ display: 'block', marginBottom: 10, textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>{c.agence.raisonSociale}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {c.poste} &middot; {c.salaireBrut.toLocaleString('fr-FR')} FCFA/mois
                    </div>
                  </div>
                  <span className={`badge ${cs.className}`}>{cs.label}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
