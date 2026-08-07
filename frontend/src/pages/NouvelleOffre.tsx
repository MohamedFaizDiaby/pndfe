import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const TYPES = ['BTP', 'GARDIENNAGE', 'DOMESTIQUE', 'RESTAURATION', 'AGRICULTURE', 'MANUTENTION', 'AUTRE'];

export function NouvelleOffre() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titre: '',
    typeContrat: TYPES[0],
    description: '',
    lieuTravail: '',
    salaireBrut: '',
    nombrePostes: '1',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/agences/offres', {
        titre: form.titre,
        typeContrat: form.typeContrat,
        description: form.description,
        lieuTravail: form.lieuTravail,
        salaireBrut: Number(form.salaireBrut),
        nombrePostes: Number(form.nombrePostes),
      });
      navigate('/agence/tableau-de-bord');
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la creation de l'offre");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Publier une offre d'emploi</h2>
      <p style={{ color: 'var(--muted)', marginTop: -8 }}>
        Votre offre sera visible par tous les travailleurs inscrits sur PNDFE.
      </p>
      {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Titre du poste</label>
          <input required value={form.titre} onChange={(e) => update('titre', e.target.value)} placeholder="Ex: Manoeuvre BTP" />
        </div>
        <div className="field">
          <label>Secteur</label>
          <select value={form.typeContrat} onChange={(e) => update('typeContrat', e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Description de la mission</label>
          <textarea required rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
        </div>
        <div className="field">
          <label>Lieu de travail</label>
          <input required value={form.lieuTravail} onChange={(e) => update('lieuTravail', e.target.value)} />
        </div>
        <div className="field">
          <label>Salaire brut mensuel propose (FCFA)</label>
          <input required type="number" min={0} value={form.salaireBrut} onChange={(e) => update('salaireBrut', e.target.value)} />
        </div>
        <div className="field">
          <label>Nombre de postes a pourvoir</label>
          <input required type="number" min={1} value={form.nombrePostes} onChange={(e) => update('nombrePostes', e.target.value)} />
        </div>
        <button className="btn primary" disabled={submitting} type="submit">
          {submitting ? 'Publication...' : "Publier l'offre"}
        </button>
      </form>
    </div>
  );
}
