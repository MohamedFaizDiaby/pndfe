import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface Mission {
  id: string;
  poste: string;
  typeContrat: string;
  statut: string;
  dateDebut: string;
  dateFin: string | null;
  agence: { raisonSociale: string };
  declaration: { numeroCnps: string; numeroCmu: string } | null;
}

interface PortefeuilleData {
  droitsCnpsCumules: number;
  droitsCmuCumules: number;
  totalNetPercu: number;
  nombrePaiements: number;
  missions: Mission[];
}

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  ENVOYE: { label: 'En attente de signature', className: 'orange' },
  SIGNE: { label: 'Signe', className: 'green' },
  REFUSE: { label: 'Refuse', className: 'red' },
};

const money = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

export function Portefeuille() {
  const [data, setData] = useState<PortefeuilleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/travailleurs/portefeuille')
      .then((res) => setData(res.data))
      .catch(() => setError('Impossible de charger votre portefeuille social'));
  }, []);

  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <p>Chargement de votre portefeuille...</p>;

  return (
    <div>
      <div className="hero">
        <h1>Mon portefeuille social</h1>
        <p>Vos droits de protection sociale accumules grace a vos missions declarees via PNDFE.</p>
      </div>

      <div className="card">
        <h2>Droits cumules</h2>
        <table>
          <tbody>
            <tr><th>Cotisations CNPS (retraite) versees</th><td><strong>{money(data.droitsCnpsCumules)}</strong></td></tr>
            <tr><th>Cotisations CMU versees</th><td><strong>{money(data.droitsCmuCumules)}</strong></td></tr>
            <tr><th>Total net percu</th><td><strong>{money(data.totalNetPercu)}</strong></td></tr>
            <tr><th>Nombre de paiements recus</th><td>{data.nombrePaiements}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Historique de mes missions</h2>
        {data.missions.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucune mission pour le moment.</p>
        ) : (
          data.missions.map((m) => {
            const statut = STATUT_LABEL[m.statut] || STATUT_LABEL.ENVOYE;
            return (
              <Link
                key={m.id}
                to={`/contrats/${m.id}`}
                className="card"
                style={{ display: 'block', marginBottom: 10, textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>{m.agence.raisonSociale}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {m.poste} &middot; {m.typeContrat} &middot; depuis le {new Date(m.dateDebut).toLocaleDateString('fr-FR')}
                    </div>
                    {m.declaration && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        CNPS {m.declaration.numeroCnps} &middot; CMU {m.declaration.numeroCmu}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${statut.className}`}>{statut.label}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
