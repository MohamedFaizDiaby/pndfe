import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const SECTEURS = ['', 'BTP', 'GARDIENNAGE', 'DOMESTIQUE', 'RESTAURATION', 'AGRICULTURE', 'MANUTENTION', 'AUTRE'];

interface Offre {
  id: string;
  titre: string;
  typeContrat: string;
  lieuTravail: string;
  salaireBrut: number;
  nombrePostes: number;
  agence: { raisonSociale: string };
  _count: { candidatures: number };
}

export function ListeOffres() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [secteur, setSecteur] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/offres', { params: secteur ? { typeContrat: secteur } : {} })
      .then((res) => setOffres(res.data))
      .catch(() => setError('Impossible de charger les offres'));
  }, [secteur]);

  return (
    <div>
      <div className="hero">
        <h1>Offres d'emploi disponibles</h1>
        <p>Parcourez les missions proposees par les agences agreees et postulez en quelques clics.</p>
      </div>

      <div className="card">
        <div className="tabs">
          {SECTEURS.map((s) => (
            <button key={s || 'toutes'} className={secteur === s ? 'active' : ''} onClick={() => setSecteur(s)}>
              {s || 'Tous les secteurs'}
            </button>
          ))}
        </div>

        {error && <div className="error-box">{error}</div>}

        {offres.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucune offre disponible pour le moment.</p>
        ) : (
          offres.map((o) => (
            <Link
              key={o.id}
              to={`/offres/${o.id}`}
              className="card"
              style={{ display: 'block', marginBottom: 10, textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>{o.titre}</strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {o.agence.raisonSociale} &middot; {o.lieuTravail}
                  </div>
                </div>
                <span className="badge navy">{o.typeContrat}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{o.salaireBrut.toLocaleString('fr-FR')} FCFA/mois &middot; {o.nombrePostes} poste(s)</span>
                <span style={{ color: 'var(--muted)' }}>{o._count.candidatures} candidature(s)</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
