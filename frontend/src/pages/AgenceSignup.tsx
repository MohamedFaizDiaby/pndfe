import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const SECTEURS = ['BTP', 'GARDIENNAGE', 'DOMESTIQUE', 'RESTAURATION', 'AGRICULTURE', 'MANUTENTION'];

export function AgenceSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    raisonSociale: '',
    registreCommerce: '',
    telephone: '',
    adresse: '',
  });
  const [secteurs, setSecteurs] = useState<string[]>([]);
  const [documents, setDocuments] = useState<FileList | null>(null);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const toggleSecteur = (s: string) => {
    setSecteurs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (secteurs.length === 0) {
      setError('Selectionnez au moins un secteur d\'activite');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('secteurs', secteurs.join(','));
      if (documents) {
        Array.from(documents).forEach((f) => data.append('documents', f));
      }

      const res = await api.post('/auth/register/agence', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login(res.data.accessToken, 'AGENCE');
      navigate('/agence/tableau-de-bord');
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Inscrire mon agence d'emploi</h2>
      <p style={{ color: 'var(--muted)', marginTop: -8 }}>
        Votre demande d'agrement sera transmise au Ministere pour validation.
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
          <label>Raison sociale</label>
          <input required value={form.raisonSociale} onChange={(e) => update('raisonSociale', e.target.value)} />
        </div>
        <div className="field">
          <label>Registre de commerce (RCCM)</label>
          <input required value={form.registreCommerce} onChange={(e) => update('registreCommerce', e.target.value)} />
        </div>
        <div className="field">
          <label>Telephone</label>
          <input required value={form.telephone} onChange={(e) => update('telephone', e.target.value)} />
        </div>
        <div className="field">
          <label>Adresse</label>
          <input required value={form.adresse} onChange={(e) => update('adresse', e.target.value)} />
        </div>
        <div className="field">
          <label>Secteurs d'activite</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SECTEURS.map((s) => (
              <label
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.85rem',
                  border: '1px solid var(--border)',
                  padding: '6px 10px',
                  borderRadius: 999,
                  fontWeight: 400,
                }}
              >
                <input type="checkbox" checked={secteurs.includes(s)} onChange={() => toggleSecteur(s)} />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Documents justificatifs (RCCM, attestation fiscale...)</label>
          <input type="file" multiple accept="image/*,application/pdf" onChange={(e) => setDocuments(e.target.files)} />
        </div>
        <button className="btn primary" disabled={loading} type="submit">
          {loading ? 'Envoi en cours...' : "Soumettre ma demande d'agrement"}
        </button>
      </form>
      <p style={{ marginTop: 14, fontSize: '0.85rem' }}>
        Deja inscrit ? <Link to="/agence/connexion">Se connecter</Link>
      </p>
    </div>
  );
}
