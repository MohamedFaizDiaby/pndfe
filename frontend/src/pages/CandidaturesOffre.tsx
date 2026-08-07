import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, fileUrl } from '../api/client';

interface Candidature {
  id: string;
  statut: string;
  message: string | null;
  createdAt: string;
  travailleur: { id: string; nom: string; prenoms: string; metier: string; photoUrl: string | null; statutVerification: string };
}

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: 'En attente', className: 'orange' },
  ACCEPTEE: { label: 'Acceptee', className: 'green' },
  REJETEE: { label: 'Rejetee', className: 'red' },
};

export function CandidaturesOffre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dateDebutParCandidature, setDateDebutParCandidature] = useState<Record<string, string>>({});

  const load = () => {
    if (!id) return;
    api
      .get(`/agences/offres/${id}/candidatures`)
      .then((res) => setCandidatures(res.data))
      .catch(() => setError('Impossible de charger les candidatures'));
  };

  useEffect(load, [id]);

  const accepter = async (candidatureId: string) => {
    const dateDebut = dateDebutParCandidature[candidatureId];
    if (!dateDebut) {
      setError('Choisissez une date de debut avant d\'accepter cette candidature');
      return;
    }
    setError(null);
    setBusyId(candidatureId);
    try {
      const res = await api.patch(`/agences/offres/${id}/candidatures/${candidatureId}/accepter`, { dateDebut });
      navigate(`/contrats/${res.data.contrat.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de l'acceptation");
    } finally {
      setBusyId(null);
    }
  };

  const rejeter = async (candidatureId: string) => {
    setBusyId(candidatureId);
    try {
      await api.patch(`/agences/offres/${id}/candidatures/${candidatureId}/rejeter`, {});
      load();
    } catch {
      setError('Erreur lors du rejet');
    } finally {
      setBusyId(null);
    }
  };

  if (error && candidatures.length === 0) return <div className="error-box">{error}</div>;

  return (
    <div>
      <div className="card">
        <h2>Candidatures recues</h2>
        {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

        {candidatures.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucune candidature pour le moment.</p>
        ) : (
          candidatures.map((c) => {
            const statut = STATUT_LABEL[c.statut] || STATUT_LABEL.EN_ATTENTE;
            return (
              <div key={c.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {c.travailleur.photoUrl && (
                    <img
                      src={fileUrl(c.travailleur.photoUrl)}
                      alt="Photo"
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <strong>{c.travailleur.prenoms} {c.travailleur.nom}</strong>
                      <span className={`badge ${statut.className}`}>{statut.label}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{c.travailleur.metier}</div>
                    {c.message && (
                      <p style={{ fontSize: '0.85rem', marginTop: 8, fontStyle: 'italic' }}>&laquo; {c.message} &raquo;</p>
                    )}

                    {c.statut === 'EN_ATTENTE' && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                          type="date"
                          value={dateDebutParCandidature[c.id] || ''}
                          onChange={(e) => setDateDebutParCandidature((m) => ({ ...m, [c.id]: e.target.value }))}
                          style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8 }}
                        />
                        <button className="btn secondary" disabled={busyId === c.id} onClick={() => accepter(c.id)}>
                          Accepter et creer le contrat
                        </button>
                        <button className="btn ghost" disabled={busyId === c.id} onClick={() => rejeter(c.id)}>
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
