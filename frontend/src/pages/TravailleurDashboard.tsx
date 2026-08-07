import { useEffect, useState } from 'react';
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

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: 'Verification en attente', className: 'orange' },
  VERIFIE: { label: 'Identite verifiee', className: 'green' },
  REJETE: { label: 'Identite rejetee', className: 'red' },
};

export function TravailleurDashboard() {
  const [profile, setProfile] = useState<TravailleurProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/travailleurs/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Impossible de charger votre profil'));
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
    </div>
  );
}
