import * as esbuild from 'esbuild';
import { cpSync } from 'fs';

// Charge .env s'il existe (build local) ; ignore silencieusement sinon
// (Render/Railway/Docker fournissent VITE_API_URL comme vraie variable
// d'environnement, sans fichier .env dans l'image ou le build).
try {
  process.loadEnvFile('.env');
} catch {
  // pas de .env - normal en CI/production
}

const apiUrl = process.env.VITE_API_URL || 'http://localhost:4300';

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  jsx: 'automatic',
  define: {
    __API_URL__: JSON.stringify(apiUrl),
  },
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
});

cpSync('public/index.html', 'dist/index.html');
console.log('Build de production genere dans ./dist');
