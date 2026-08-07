import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth, Role } from '../auth/AuthContext';

interface LoginProps {
  title: string;
  expectedRole: Role;
  redirectTo: string;
  registerLink?: { to: string; label: string };
}

export function Login({ title, expectedRole, redirectTo, registerLink }: LoginProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.role !== expectedRole) {
        setError("Ce compte n'a pas acces a cet espace.");
        return;
      }
      login(res.data.accessToken, res.data.role);
      navigate(redirectTo);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2>{title}</h2>
      {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn primary" disabled={loading} type="submit">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      {registerLink && (
        <p style={{ marginTop: 14, fontSize: '0.85rem' }}>
          Pas encore de compte ? <Link to={registerLink.to}>{registerLink.label}</Link>
        </p>
      )}
    </div>
  );
}
