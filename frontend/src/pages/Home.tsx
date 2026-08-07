import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <div className="hero">
        <h1>Chaque travailleur compte. Chaque contrat protege.</h1>
        <p>
          PNDFE donne une identite numerique aux travailleurs de l'economie informelle
          (BTP, gardiennage, domestique...), permet des contrats et des paiements legaux,
          et donne au Ministere une visibilite en temps reel sur l'emploi formel en Cote d'Ivoire.
        </p>
        <div className="actor-grid">
          <Link className="actor-card" to="/travailleur/inscription">
            👷 Je suis travailleur
          </Link>
          <Link className="actor-card" to="/agence/inscription">
            🏢 Je suis une agence d'emploi
          </Link>
          <Link className="actor-card" to="/offres">
            🔎 Voir les offres d'emploi
          </Link>
          <Link className="actor-card" to="/admin/connexion">
            🏛️ Espace Ministere / CNPS
          </Link>
          <Link className="actor-card" to="/scanner">
            📷 Verifier un QR Code
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Ce que couvre cette version</h2>
        <p>
          Identite numerique et carte professionnelle QR, agrement des agences, contrats de
          travail electroniques avec declaration CNPS/CMU automatique, paiement des salaires
          (Mobile Money simule) avec bulletin de paie PDF, portefeuille social du travailleur,
          et mise en relation : les agences publient des offres, les travailleurs postulent.
        </p>
      </div>
    </div>
  );
}
