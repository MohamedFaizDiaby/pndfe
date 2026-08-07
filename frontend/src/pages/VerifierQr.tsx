import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, fileUrl } from '../api/client';

interface VerificationResult {
  nom: string;
  prenoms: string;
  metier: string;
  photoUrl: string | null;
  statutVerification: string;
  membreDepuis: string;
  historiqueMissions: unknown[];
}

export function VerifierQr() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get(`/travailleurs/verifier/${token}`)
      .then((res) => setResult(res.data))
      .catch(() => setError('QR Code invalide ou travailleur introuvable.'));
  }, [token]);

  if (error) return <div className="error-box">{error}</div>;
  if (!result) return <p>Verification en cours...</p>;

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <span className="badge green" style={{ marginBottom: 12 }}>Identite verifiee par PNDFE</span>
      {result.photoUrl && (
        <div>
          <img
            src={fileUrl(result.photoUrl)}
            alt="Photo"
            style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: '50%', margin: '10px 0' }}
          />
        </div>
      )}
      <h2>{result.prenoms} {result.nom}</h2>
      <p style={{ color: 'var(--muted)' }}>Metier declare : <strong>{result.metier}</strong></p>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
        Membre PNDFE depuis le {new Date(result.membreDepuis).toLocaleDateString('fr-FR')}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 16 }}>
        L'historique des missions et contrats sera disponible a l'Etape 2 de la plateforme.
      </p>
    </div>
  );
}
