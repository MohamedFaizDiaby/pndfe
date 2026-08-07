import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

interface Contrat {
  id: string;
  poste: string;
  typeContrat: string;
  statut: string;
  salaireBrut: number;
  travailleur: { nom: string; prenoms: string };
  createdAt: string;
}

interface Offre {
  id: string;
  titre: string;
  typeContrat: string;
  statut: string;
  salaireBrut: number;
  _count: { candidatures: number };
}

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "Agrement en attente d'examen", className: 'orange' },
  APPROUVE: { label: 'Agrement approuve', className: 'green' },
  REJETE: { label: 'Agrement rejete', className: 'red' },
};

const CONTRAT_STATUT_LABEL: Record<string, { label: string; className: string }> = {
  ENVOYE: { label: 'En attente de signature', className: 'orange' },
  SIGNE: { label: 'Signe', className: 'green' },
  REFUSE: { label: 'Refuse', className: 'red' },
};

export function AgenceDashboard() {
  const [profile, setProfile] = useState<AgenceProfile | null>(null);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/agences/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Impossible de charger le profil de votre agence'));
    api
      .get('/agences/contrats')
      .then((res) => setContrats(res.data))
      .catch(() => {});
    api
      .get('/agences/offres')
      .then((res) => setOffres(res.data))
      .catch(() => {});
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!profile) return <p>Chargement...</p>;

  const statut = STATUT_LABEL[profile.demandeAgrement?.statut || 'EN_ATTENTE'];
  const estAgreee = profile.demandeAgrement?.statut === 'APPROUVE';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0 }}>Contrats de travail</h2>
          {estAgreee && (
            <Link className="btn primary" to="/agence/contrats/nouveau">+ Nouveau contrat</Link>
          )}
        </div>

        {!estAgreee && (
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>
            Votre agence pourra creer des contrats de travail une fois son agrement approuve par le Ministere.
          </p>
        )}

        {estAgreee && contrats.length === 0 && (
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>Aucun contrat cree pour le moment.</p>
        )}

        {contrats.map((c) => {
          const cs = CONTRAT_STATUT_LABEL[c.statut] || CONTRAT_STATUT_LABEL.ENVOYE;
          return (
            <Link
              key={c.id}
              to={`/contrats/${c.id}`}
              className="card"
              style={{ display: 'block', marginTop: 10, marginBottom: 0, textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <strong>{c.travailleur.prenoms} {c.travailleur.nom}</strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {c.poste} &middot; {c.typeContrat} &middot; {c.salaireBrut.toLocaleString('fr-FR')} FCFA/mois
                  </div>
                </div>
                <span className={`badge ${cs.className}`}>{cs.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0 }}>Offres d'emploi</h2>
          {estAgreee && (
            <Link className="btn primary" to="/agence/offres/nouvelle">+ Nouvelle offre</Link>
          )}
        </div>

        {!estAgreee && (
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>
            Votre agence pourra publier des offres d'emploi une fois son agrement approuve par le Ministere.
          </p>
        )}

        {estAgreee && offres.length === 0 && (
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>Aucune offre publiee pour le moment.</p>
        )}

        {offres.map((o) => (
          <Link
            key={o.id}
            to={`/agence/offres/${o.id}/candidatures`}
            className="card"
            style={{ display: 'block', marginTop: 10, marginBottom: 0, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <strong>{o.titre}</strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {o.typeContrat} &middot; {o.salaireBrut.toLocaleString('fr-FR')} FCFA/mois &middot; {o._count.candidatures} candidature(s)
                </div>
              </div>
              <span className={`badge ${o.statut === 'OUVERTE' ? 'green' : 'red'}`}>{o.statut}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
