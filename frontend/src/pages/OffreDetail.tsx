import { FormEvent, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Offre {
  id: string;
  titre: string;
  typeContrat: string;
  description: string;
  lieuTravail: string;
  salaireBrut: number;
  nombrePostes: number;
  statut: string;
  agence: { raisonSociale: string; adresse: string; telephone: string };
  _count: { candidatures: number };
}

export function OffreDetail() {
  const { id } = useParams<{ id: string }>();
  const { token, role } = useAuth();
  const [offre, setOffre] = useState<Offre | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [postulerError, setPostulerError] = useState<string | null>(null);
  const [postuleAvecSucces, setPostuleAvecSucces] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/offres/${id}`)
      .then((res) => setOffre(res.data))
      .catch(() => setError('Offre introuvable'));
  }, [id]);

  const postuler = async (e: FormEvent) => {
    e.preventDefault();
    setPostulerError(null);
    setBusy(true);
    try {
      await api.post(`/offres/${id}/candidatures`, { message: message || undefined });
      setPostuleAvecSucces(true);
    } catch (err: any) {
      setPostulerError(err?.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="error-box">{error}</div>;
  if (!offre) return <p>Chargement de l'offre...</p>;

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>{offre.titre}</h2>
          <span className={`badge ${offre.statut === 'OUVERTE' ? 'green' : 'red'}`}>{offre.statut}</span>
        </div>
        <p style={{ color: 'var(--muted)', marginTop: 6 }}>
          {offre.agence.raisonSociale} &middot; {offre.lieuTravail}
        </p>

        <table style={{ marginTop: 12 }}>
          <tbody>
            <tr><th>Secteur</th><td>{offre.typeContrat}</td></tr>
            <tr><th>Salaire brut propose</th><td>{offre.salaireBrut.toLocaleString('fr-FR')} FCFA / mois</td></tr>
            <tr><th>Postes disponibles</th><td>{offre.nombrePostes}</td></tr>
            <tr><th>Candidatures recues</th><td>{offre._count.candidatures}</td></tr>
          </tbody>
        </table>

        <p style={{ marginTop: 14, whiteSpace: 'pre-wrap' }}>{offre.description}</p>
      </div>

      <div className="card">
        <h2>Postuler a cette offre</h2>

        {!token && (
          <p style={{ color: 'var(--muted)' }}>
            <Link to="/travailleur/connexion">Connectez-vous</Link> en tant que travailleur pour postuler
            (ou <Link to="/travailleur/inscription">creez votre profil</Link> si vous n'en avez pas encore).
          </p>
        )}

        {token && role !== 'TRAVAILLEUR' && (
          <p style={{ color: 'var(--muted)' }}>Seuls les travailleurs peuvent postuler a une offre.</p>
        )}

        {token && role === 'TRAVAILLEUR' && offre.statut !== 'OUVERTE' && (
          <p style={{ color: 'var(--muted)' }}>Cette offre n'accepte plus de candidatures.</p>
        )}

        {token && role === 'TRAVAILLEUR' && offre.statut === 'OUVERTE' && !postuleAvecSucces && (
          <form onSubmit={postuler}>
            {postulerError && <div className="error-box" style={{ marginBottom: 12 }}>{postulerError}</div>}
            <div className="field">
              <label>Message a l'agence (optionnel)</label>
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Presentez-vous en quelques mots..." />
            </div>
            <button className="btn primary" disabled={busy} type="submit">
              {busy ? 'Envoi...' : 'Envoyer ma candidature'}
            </button>
          </form>
        )}

        {postuleAvecSucces && (
          <div className="success-box">
            Votre candidature a bien ete envoyee. Vous pouvez suivre son statut depuis{' '}
            <Link to="/travailleur/candidatures">mes candidatures</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
