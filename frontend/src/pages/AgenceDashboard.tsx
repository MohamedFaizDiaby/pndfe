import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Document {
  id: string;
  nomFichier: string;
  type: string;
}

interface DemandeAgrement {
  statut: string;
  commentaireAdmin: string | null;
  dateTraitement: string | null;
}

interface AgenceProfile {
  raisonSociale: string;
  registreCommerce: string;
  telephone: string;
  adresse: string;
  secteurs: string[];
  documents: Document[];
  demandeAgrement: DemandeAgrement | null;
  createdAt: string;
}

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "Agrement en attente d'examen", className: 'orange' },
  APPROUVE: { label: 'Agrement approuve', className: 'green' },
  REJETE: { label: 'Agrement rejete', className: 'red' },
};

export function AgenceDashboard() {
  const [profile, setProfile] = useState<AgenceProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/agences/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Impossible de charger le profil de votre agence'));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!profile) return <p>Chargement...</p>;

  const statut = STATUT_LABEL[profile.demandeAgrement?.statut || 'EN_ATTENTE'];

  return (
    <div>
      <div className="card">
        <h2>{profile.raisonSociale}</h2>
        <span className={`badge ${statut.className}`}>{statut.label}</span>
        {profile.demandeAgrement?.commentaireAdmin && (
          <p style={{ marginTop: 10, fontSize: '0.88rem', color: 'var(--muted)' }}>
            Commentaire du Ministere : {profile.demandeAgrement.commentaireAdmin}
          </p>
        )}
        <table style={{ marginTop: 16 }}>
          <tbody>
            <tr><th>RCCM</th><td>{profile.registreCommerce}</td></tr>
            <tr><th>Telephone</th><td>{profile.telephone}</td></tr>
            <tr><th>Adresse</th><td>{profile.adresse}</td></tr>
            <tr><th>Secteurs</th><td>{profile.secteurs.join(', ')}</td></tr>
            <tr><th>Inscrite depuis</th><td>{new Date(profile.createdAt).toLocaleDateString('fr-FR')}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Documents transmis</h2>
        {profile.documents.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucun document transmis.</p>
        ) : (
          <ul className="doc-list">
            {profile.documents.map((d) => (
              <li key={d.id}>
                <span>{d.nomFichier}</span>
                <span className="badge navy">{d.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Prochaines etapes</h2>
        <p style={{ color: 'var(--muted)' }}>
          Une fois votre agrement approuve par le Ministere, vous pourrez creer des contrats
          de travail et gerer vos travailleurs depuis ce tableau de bord (Etape 2 du projet).
        </p>
      </div>
    </div>
  );
}
