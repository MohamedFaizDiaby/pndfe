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
          <Link className="actor-card" to="/admin/connexion">
            🏛️ Espace Ministere / CNPS
          </Link>
          <Link className="actor-card" to="/scanner">
            📷 Verifier un QR Code
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Etape 1 du projet : l'identite numerique</h2>
        <p>
          Cette version couvre le premier jalon du PNDFE (semaines 1 a 6) : l'inscription des
          travailleurs et des agences, la verification d'identite et la carte professionnelle
          a QR Code scannable. Les contrats, la paie Mobile Money et le tableau de bord national
          complet arrivent dans les etapes suivantes du calendrier de mise en service.
        </p>
      </div>
    </div>
  );
}
