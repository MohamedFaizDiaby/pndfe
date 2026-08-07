import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function extractToken(scanned: string): string {
  try {
    const url = new URL(scanned);
    // Le QR encode une URL avec routage par hash: https://host/#/verifier/<token>
    const source = url.hash ? url.hash.replace(/^#/, '') : url.pathname;
    const parts = source.split('/').filter(Boolean);
    return parts[parts.length - 1] || scanned;
  } catch {
    return scanned;
  }
}

export function QrScanner() {
  const navigate = useNavigate();
  const [manualToken, setManualToken] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 240 }, false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        navigate(`/verifier/${extractToken(decodedText)}`);
      },
      () => {
        // ignore per-frame scan failures (normal while searching for a code)
      },
    );

    return () => {
      scanner.clear().catch(() => {
        // scanner already stopped
      });
    };
  }, [navigate]);

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      navigate(`/verifier/${extractToken(manualToken.trim())}`);
    }
  };

  return (
    <div className="card">
      <h2>Verifier l'identite d'un travailleur</h2>
      <p style={{ color: 'var(--muted)' }}>
        Scannez le QR Code de la carte professionnelle du travailleur avec votre camera.
      </p>
      <div id="qr-reader" />
      {cameraError && <div className="error-box" style={{ marginTop: 12 }}>{cameraError}</div>}

      <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          Pas de camera disponible ? Saisissez le code manuellement :
        </p>
        <form onSubmit={submitManual} style={{ flexDirection: 'row', gap: 8 }}>
          <input
            style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8 }}
            placeholder="Coller le code ou l'URL du QR"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
          <button className="btn secondary" type="submit">Verifier</button>
        </form>
      </div>
    </div>
  );
}
