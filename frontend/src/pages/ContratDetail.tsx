import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, fileUrl } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface Contrat {
  id: string;
  typeContrat: string;
  poste: string;
  lieuTravail: string;
  salaireBrut: number;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  signatureTravailleurNom: string | null;
  signatureTravailleurAt: string | null;
  motifRefus: string | null;
  pdfUrl: string | null;
  agence: { raisonSociale: string; telephone: string; adresse: string; registreCommerce: string };
  travailleur: { nom: string; prenoms: string; metier: string; photoUrl: string | null };
  declaration: { numeroCnps: string; numeroCmu: string; dateDeclaration: string } | null;
  createdAt: string;
}

const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  ENVOYE: { label: 'En attente de signature', className: 'orange' },
  SIGNE: { label: 'Signe', className: 'green' },
  REFUSE: { label: 'Refuse', className: 'red' },
};

export function ContratDetail() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [signatureNom, setSignatureNom] = useState('');
  const [accepteConditions, setAccepteConditions] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!id) return;
    api
      .get(`/contrats/${id}`)
      .then((res) => setContrat(res.data))
      .catch(() => setError('Impossible de charger ce contrat'));
  };

  useEffect(load, [id]);

  const signer = async (e: FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setBusy(true);
    try {
      await api.patch(`/contrats/${id}/signer`, { signatureNom, accepteConditions });
      load();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Erreur lors de la signature');
    } finally {
      setBusy(false);
    }
  };

  const refuser = async () => {
    const motif = window.prompt('Motif du refus (optionnel) :') || undefined;
    setBusy(true);
    try {
      await api.patch(`/contrats/${id}/refuser`, { motif });
      load();
    } catch {
      setActionError('Erreur lors du refus du contrat');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="error-box">{error}</div>;
  if (!contrat) return <p>Chargement du contrat...</p>;

  const statut = STATUT_LABEL[contrat.statut] || STATUT_LABEL.ENVOYE;

  return (
    <div>
      <div className="card">
        <h2>Contrat de travail</h2>
        <span className={`badge ${statut.className}`}>{statut.label}</span>

        <table style={{ marginTop: 16 }}>
          <tbody>
            <tr><th>Employeur</th><td>{contrat.agence.raisonSociale}</td></tr>
            <tr><th>Travailleur</th><td>{contrat.travailleur.prenoms} {contrat.travailleur.nom}</td></tr>
            <tr><th>Type / secteur</th><td>{contrat.typeContrat}</td></tr>
            <tr><th>Poste</th><td>{contrat.poste}</td></tr>
            <tr><th>Lieu de travail</th><td>{contrat.lieuTravail}</td></tr>
            <tr><th>Salaire brut</th><td>{contrat.salaireBrut.toLocaleString('fr-FR')} FCFA / mois</td></tr>
            <tr><th>Date de debut</th><td>{new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}</td></tr>
            <tr><th>Date de fin</th><td>{contrat.dateFin ? new Date(contrat.dateFin).toLocaleDateString('fr-FR') : 'Duree indeterminee'}</td></tr>
          </tbody>
        </table>

        {contrat.statut === 'REFUSE' && contrat.motifRefus && (
          <p style={{ marginTop: 12, color: 'var(--red)', fontSize: '0.88rem' }}>
            Motif du refus : {contrat.motifRefus}
          </p>
        )}
      </div>

      {contrat.statut === 'ENVOYE' && role === 'TRAVAILLEUR' && (
        <div className="card">
          <h2>Signer ce contrat</h2>
          <p style={{ color: 'var(--muted)' }}>
            En signant, vous acceptez les termes du contrat ci-dessus. Cette signature declenche
            automatiquement votre declaration CNPS et votre couverture CMU.
          </p>
          {actionError && <div className="error-box" style={{ marginBottom: 12 }}>{actionError}</div>}
          <form onSubmit={signer}>
            <div className="field">
              <label>Tapez votre nom complet en guise de signature</label>
              <input required value={signatureNom} onChange={(e) => setSignatureNom(e.target.value)} placeholder="Prenoms Nom" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
              <input type="checkbox" checked={accepteConditions} onChange={(e) => setAccepteConditions(e.target.checked)} />
              Je certifie avoir lu et j'accepte les termes de ce contrat.
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button className="btn primary" disabled={busy} type="submit">Signer le contrat</button>
              <button className="btn ghost" disabled={busy} type="button" onClick={refuser}>Refuser</button>
            </div>
          </form>
        </div>
      )}

      {contrat.statut === 'SIGNE' && (
        <div className="card">
          <h2>Protection sociale</h2>
          <p style={{ color: 'var(--muted)' }}>
            Signe par {contrat.signatureTravailleurNom} le{' '}
            {contrat.signatureTravailleurAt && new Date(contrat.signatureTravailleurAt).toLocaleString('fr-FR')}.
          </p>
          {contrat.declaration && (
            <table>
              <tbody>
                <tr><th>N&deg; CNPS</th><td>{contrat.declaration.numeroCnps}</td></tr>
                <tr><th>N&deg; CMU</th><td>{contrat.declaration.numeroCmu}</td></tr>
                <tr><th>Declare le</th><td>{new Date(contrat.declaration.dateDeclaration).toLocaleDateString('fr-FR')}</td></tr>
              </tbody>
            </table>
          )}
          {contrat.pdfUrl && (
            <a className="btn secondary" href={fileUrl(contrat.pdfUrl)} target="_blank" rel="noreferrer" style={{ marginTop: 14, display: 'inline-block' }}>
              Telecharger le contrat signe (PDF)
            </a>
          )}
        </div>
      )}
    </div>
  );
}
