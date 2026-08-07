import { Link, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <div className="brand">
            PNDFE
            <small>Plateforme Numerique de l'Emploi Formel &middot; Cote d'Ivoire</small>
          </div>
        </Link>
        <nav>
          {!token && (
            <>
              <Link to="/travailleur/connexion">Espace travailleur</Link>
              <Link to="/agence/connexion">Espace agence</Link>
              <Link to="/admin/connexion">Ministere</Link>
            </>
          )}
          {token && role === 'TRAVAILLEUR' && <Link to="/travailleur/tableau-de-bord">Mon profil</Link>}
          {token && role === 'AGENCE' && <Link to="/agence/tableau-de-bord">Mon agence</Link>}
          {token && role === 'ADMIN' && <Link to="/admin/tableau-de-bord">Pilotage</Link>}
          <Link to="/scanner">Scanner un QR Code</Link>
          {token && <button onClick={handleLogout}>Deconnexion</button>}
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
