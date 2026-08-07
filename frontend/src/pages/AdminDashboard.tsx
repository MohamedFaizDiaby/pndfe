import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Agence {
  id: string;
  raisonSociale: string;
  registreCommerce: string;
  telephone: string;
  secteurs: string[];
  user: { email: string };
  demandeAgrement: { statut: string; commentaireAdmin: string | null } | null;
  createdAt: string;
}

interface Stats {
  totalTravailleurs: number;
  parMetier: { metier: string; count: number }[];
  totalContratsSignes: number;
  totalDeclarations: number;
}

interface Declaration {
  id: string;
  numeroCnps: string;
  numeroCmu: string;
  dateDeclaration: string;
  contrat: {
    poste: string;
    agence: { raisonSociale: string };
    travailleur: { nom: string; prenoms: string; metier: string };
  };
}

const FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'APPROUVE', label: 'Approuvees' },
  { value: 'REJETE', label: 'Rejetees' },
];

export function AdminDashboard() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    api
      .get('/admin/agences', { params: filter ? { statut: filter } : {} })
      .then((res) => setAgences(res.data))
      .catch(() => setError('Impossible de charger les agences'));
    api
      .get('/admin/stats/travailleurs')
      .then((res) => setStats(res.data))
      .catch(() => {});
    api
      .get('/admin/declarations')
      .then((res) => setDeclarations(res.data))
      .catch(() => {});
  };

  useEffect(load, [filter]);

  const traiter = async (id: string, statut: 'APPROUVE' | 'REJETE') => {
    const commentaire = statut === 'REJETE' ? window.prompt('Motif du rejet (optionnel) :') || undefined : undefined;
    setBusyId(id);
    try {
      await api.patch(`/admin/agences/${id}/agrement`, { statut, commentaire });
      load();
    } catch {
      setError("Erreur lors du traitement de l'agrement");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Pilotage national</h2>
        {stats ? (
          <>
            <p>
              <strong>{stats.totalTravailleurs}</strong> travailleur(s) inscrit(s) &middot;{' '}
              <strong>{stats.totalContratsSignes}</strong> contrat(s) signe(s) &middot;{' '}
              <strong>{stats.totalDeclarations}</strong> declaration(s) CNPS/CMU.
            </p>
            {stats.parMetier.length > 0 && (
              <table>
                <thead>
                  <tr><th>Secteur</th><th>Travailleurs</th></tr>
                </thead>
                <tbody>
                  {stats.parMetier.map((m) => (
                    <tr key={m.metier}><td>{m.metier}</td><td>{m.count}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p>Chargement des indicateurs...</p>
        )}
      </div>

      <div className="card">
        <h2>Demandes d'agrement des agences</h2>
        {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="tabs">
          {FILTERS.map((f) => (
            <button key={f.value} className={filter === f.value ? 'active' : ''} onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>

        {agences.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucune agence dans cette categorie.</p>
        ) : (
          agences.map((a) => {
            const statut = a.demandeAgrement?.statut || 'EN_ATTENTE';
            return (
              <div key={a.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>{a.raisonSociale}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {a.user.email} &middot; RCCM {a.registreCommerce} &middot; {a.secteurs.join(', ')}
                    </div>
                  </div>
                  <span
                    className={`badge ${statut === 'APPROUVE' ? 'green' : statut === 'REJETE' ? 'red' : 'orange'}`}
                  >
                    {statut}
                  </span>
                </div>
                {statut === 'EN_ATTENTE' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn secondary" disabled={busyId === a.id} onClick={() => traiter(a.id, 'APPROUVE')}>
                      Approuver
                    </button>
                    <button className="btn ghost" disabled={busyId === a.id} onClick={() => traiter(a.id, 'REJETE')}>
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="card">
        <h2>Declarations CNPS / CMU</h2>
        <p style={{ color: 'var(--muted)', marginTop: -6 }}>
          Generees automatiquement a chaque signature de contrat de travail.
        </p>
        {declarations.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucune declaration pour le moment.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Travailleur</th>
                <th>Agence</th>
                <th>N&deg; CNPS</th>
                <th>N&deg; CMU</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {declarations.map((d) => (
                <tr key={d.id}>
                  <td>{d.contrat.travailleur.prenoms} {d.contrat.travailleur.nom}</td>
                  <td>{d.contrat.agence.raisonSociale}</td>
                  <td>{d.numeroCnps}</td>
                  <td>{d.numeroCmu}</td>
                  <td>{new Date(d.dateDeclaration).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
