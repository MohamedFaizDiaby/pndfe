import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api, fileUrl } from '../api/client';
import { extractToken } from '../utils/qr';

const TYPES = ['BTP', 'GARDIENNAGE', 'DOMESTIQUE', 'RESTAURATION', 'AGRICULTURE', 'MANUTENTION', 'AUTRE'];

interface IdentitePreview {
  nom: string;
  prenoms: string;
  metier: string;
  photoUrl: string | null;
}

export function NouveauContrat() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [identite, setIdentite] = useState<IdentitePreview | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const [form, setForm] = useState({
    typeContrat: TYPES[0],
    poste: '',
    lieuTravail: '',
    salaireBrut: '',
    dateDebut: '',
    dateFin: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const lookupTravailleur = async (rawToken: string) => {
    const t = extractToken(rawToken.trim());
    setScanError(null);
    try {
      const res = await api.get(`/travailleurs/verifier/${t}`);
      setIdentite(res.data);
      setToken(t);
    } catch {
      setScanError('QR Code invalide ou travailleur introuvable. Reessayez.');
    }
  };

  useEffect(() => {
    if (token) return; // travailleur deja identifie, pas besoin de la camera

    const scanner = new Html5QrcodeScanner('qr-reader-contrat', { fps: 10, qrbox: 220 }, false);
    scannerRef.current = scanner;
    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {});
        lookupTravailleur(decodedText);
      },
      () => {},
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [token]);

  const changerTravailleur = () => {
    setToken(null);
    setIdentite(null);
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await api.post('/agences/contrats', {
        travailleurQrToken: token,
        typeContrat: form.typeContrat,
        poste: form.poste,
        lieuTravail: form.lieuTravail,
        salaireBrut: Number(form.salaireBrut),
        dateDebut: form.dateDebut,
        dateFin: form.dateFin || undefined,
      });
      navigate(`/contrats/${res.data.id}`);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Erreur lors de la creation du contrat');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !identite) {
    return (
      <div className="card">
        <h2>Nouveau contrat de travail</h2>
        <p style={{ color: 'var(--muted)' }}>
          Scannez le QR Code de la carte professionnelle du travailleur pour demarrer le contrat.
        </p>
        <div id="qr-reader-contrat" />
        {scanError && <div className="error-box" style={{ marginTop: 12 }}>{scanError}</div>}

        <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Pas de camera disponible ? Saisissez le code manuellement :
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualToken.trim()) lookupTravailleur(manualToken.trim());
            }}
            style={{ flexDirection: 'row', gap: 8 }}
          >
            <input
              style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8 }}
              placeholder="Coller le code ou l'URL du QR"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
            />
            <button className="btn secondary" type="submit">Rechercher</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {identite.photoUrl && (
          <img
            src={fileUrl(identite.photoUrl)}
            alt="Photo"
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%' }}
          />
        )}
        <div style={{ flex: 1 }}>
          <strong>{identite.prenoms} {identite.nom}</strong>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{identite.metier}</div>
        </div>
        <button className="btn ghost" onClick={changerTravailleur} type="button">Changer</button>
      </div>

      <div className="card">
        <h2>Details du contrat</h2>
        {submitError && <div className="error-box" style={{ marginBottom: 12 }}>{submitError}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Type de contrat / secteur</label>
            <select value={form.typeContrat} onChange={(e) => update('typeContrat', e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Poste occupe</label>
            <input required value={form.poste} onChange={(e) => update('poste', e.target.value)} placeholder="Ex: Manoeuvre, Agent de gardiennage..." />
          </div>
          <div className="field">
            <label>Lieu de travail</label>
            <input required value={form.lieuTravail} onChange={(e) => update('lieuTravail', e.target.value)} placeholder="Ex: Cocody, Abidjan" />
          </div>
          <div className="field">
            <label>Salaire brut mensuel (FCFA)</label>
            <input required type="number" min={0} value={form.salaireBrut} onChange={(e) => update('salaireBrut', e.target.value)} />
          </div>
          <div className="field">
            <label>Date de debut</label>
            <input required type="date" value={form.dateDebut} onChange={(e) => update('dateDebut', e.target.value)} />
          </div>
          <div className="field">
            <label>Date de fin (optionnel)</label>
            <input type="date" value={form.dateFin} onChange={(e) => update('dateFin', e.target.value)} />
            <small>Laisser vide pour un contrat a duree indeterminee.</small>
          </div>
          <button className="btn primary" disabled={submitting} type="submit">
            {submitting ? 'Envoi en cours...' : 'Envoyer le contrat au travailleur'}
          </button>
        </form>
      </div>
    </div>
  );
}
