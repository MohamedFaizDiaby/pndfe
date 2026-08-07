import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface EntreeJournal {
  id: string;
  userId: string | null;
  userEmail: string | null;
  role: string | null;
  action: string;
  entite: string | null;
  entiteId: string | null;
  details: Record<string, unknown> | null;
  adresseIp: string | null;
  createdAt: string;
}

const ACTIONS = [
  '',
  'CONNEXION_REUSSIE',
  'CONNEXION_ECHOUEE',
  'INSCRIPTION_TRAVAILLEUR',
  'INSCRIPTION_AGENCE',
  'AGREMENT_TRAITE',
  'CONTRAT_CREE',
  'CONTRAT_SIGNE',
  'CONTRAT_REFUSE',
  'PAIEMENT_EFFECTUE',
  'OFFRE_CREEE',
  'CANDIDATURE_CREEE',
  'CANDIDATURE_ACCEPTEE',
  'CANDIDATURE_REJETEE',
];

const ACTION_CLASS: Record<string, string> = {
  CONNEXION_ECHOUEE: 'red',
  CONTRAT_REFUSE: 'red',
  CANDIDATURE_REJETEE: 'red',
  CONNEXION_REUSSIE: 'green',
  CONTRAT_SIGNE: 'green',
  PAIEMENT_EFFECTUE: 'green',
  CANDIDATURE_ACCEPTEE: 'green',
};

export function JournalAudit() {
  const [entries, setEntries] = useState<EntreeJournal[]>([]);
  const [action, setAction] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/admin/journal', { params: action ? { action } : {} })
      .then((res) => setEntries(res.data))
      .catch(() => setError('Impossible de charger le journal'));
  }, [action]);

  return (
    <div>
      <div className="card">
        <h2>Journal d'audit</h2>
        <p style={{ color: 'var(--muted)', marginTop: -6 }}>
          Tracabilite des actions sensibles de la plateforme (connexions, contrats, paiements,
          agrements, candidatures). Les 100 evenements les plus recents sont affiches.
        </p>

        {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="field" style={{ maxWidth: 320 }}>
          <label>Filtrer par action</label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            {ACTIONS.map((a) => (
              <option key={a || 'toutes'} value={a}>{a || 'Toutes les actions'}</option>
            ))}
          </select>
        </div>

        {entries.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucun evenement pour le moment.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Utilisateur</th>
                  <th>Entite</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(e.createdAt).toLocaleString('fr-FR')}</td>
                    <td>
                      <span className={`badge ${ACTION_CLASS[e.action] || 'navy'}`}>{e.action}</span>
                    </td>
                    <td>{e.userEmail || <span style={{ color: 'var(--muted)' }}>anonyme</span>} {e.role && `(${e.role})`}</td>
                    <td>{e.entite ? `${e.entite}${e.entiteId ? ' · ' + e.entiteId.slice(0, 8) : ''}` : '—'}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{e.adresseIp || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
