import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface Candidature {
  id: string;
  statut: string;
  message: string | null;
  createdAt: string;
  offre: {
    id: string;
    titre: string;
    typeContrat: string;
    lieuTravail: string;
    salaireBrut: number;
    agence: { raisonSociale: string };
  };
}

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: 'En attente', className: 'orange' },
  ACCEPTEE: { label: 'Acceptee', className: 'green' },
  REJETEE: { label: 'Non retenue', className: 'red' },
};

export function MesCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/travailleurs/candidatures')
      .then((res) => setCandidatures(res.data))
      .catch(() => setError('Impossible de charger vos candidatures'));
  }, []);

  if (error) return <div className="error-box">{error}</div>;

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0 }}>Mes candidatures</h2>
          <Link className="btn primary" to="/offres">Voir les offres</Link>
        </div>

        {candidatures.length === 0 ? (
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>
            Vous n'avez postule a aucune offre pour le moment.
          </p>
        ) : (
          candidatures.map((c) => {
            const statut = STATUT_LABEL[c.statut] || STATUT_LABEL.EN_ATTENTE;
            return (
              <Link
                key={c.id}
                to={`/offres/${c.offre.id}`}
                className="card"
                style={{ display: 'block', marginTop: 10, marginBottom: 0, textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>{c.offre.titre}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {c.offre.agence.raisonSociale} &middot; {c.offre.lieuTravail} &middot;{' '}
                      {c.offre.salaireBrut.toLocaleString('fr-FR')} FCFA/mois
                    </div>
                  </div>
                  <span className={`badge ${statut.className}`}>{statut.label}</span>
                </div>
                {c.statut === 'ACCEPTEE' && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--green)', marginTop: 8, marginBottom: 0 }}>
                    Felicitations ! Consultez votre contrat depuis votre tableau de bord.
                  </p>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
