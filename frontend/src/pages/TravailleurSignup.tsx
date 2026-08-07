import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const METIERS = [
  'BTP',
  'GARDIENNAGE',
  'DOMESTIQUE',
  'RESTAURATION',
  'AGRICULTURE',
  'MANUTENTION',
  'AUTRE',
];

export function TravailleurSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    nom: '',
    prenoms: '',
    dateNaissance: '',
    telephone: '',
    metier: METIERS[0],
    numeroPieceIdentite: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (photo) data.append('photo', photo);
      if (pieceIdentite) data.append('pieceIdentite', pieceIdentite);

      const res = await api.post('/auth/register/travailleur', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login(res.data.accessToken, 'TRAVAILLEUR');
      navigate('/travailleur/tableau-de-bord');
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Creer mon identite numerique</h2>
      <p style={{ color: 'var(--muted)', marginTop: -8 }}>
        Ces informations serviront a generer votre carte professionnelle avec QR Code.
      </p>
      {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>
        <div className="field">
          <label>Nom</label>
          <input required value={form.nom} onChange={(e) => update('nom', e.target.value)} />
        </div>
        <div className="field">
          <label>Prenoms</label>
          <input required value={form.prenoms} onChange={(e) => update('prenoms', e.target.value)} />
        </div>
        <div className="field">
          <label>Date de naissance</label>
          <input type="date" required value={form.dateNaissance} onChange={(e) => update('dateNaissance', e.target.value)} />
        </div>
        <div className="field">
          <label>Telephone (Mobile Money)</label>
          <input required placeholder="+225 07 00 00 00 00" value={form.telephone} onChange={(e) => update('telephone', e.target.value)} />
        </div>
        <div className="field">
          <label>Metier / secteur</label>
          <select value={form.metier} onChange={(e) => update('metier', e.target.value)}>
            {METIERS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Numero de piece d'identite (CNI)</label>
          <input required value={form.numeroPieceIdentite} onChange={(e) => update('numeroPieceIdentite', e.target.value)} />
        </div>
        <div className="field">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </div>
        <div className="field">
          <label>Piece d'identite (photo ou PDF)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setPieceIdentite(e.target.files?.[0] || null)} />
        </div>
        <button className="btn primary" disabled={loading} type="submit">
          {loading ? 'Creation en cours...' : 'Creer mon profil'}
        </button>
      </form>
      <p style={{ marginTop: 14, fontSize: '0.85rem' }}>
        Deja inscrit ? <Link to="/travailleur/connexion">Se connecter</Link>
      </p>
    </div>
  );
}
