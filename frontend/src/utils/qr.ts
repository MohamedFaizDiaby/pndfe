export function extractToken(scanned: string): string {
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
