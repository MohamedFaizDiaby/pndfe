import * as esbuild from 'esbuild';
import { cpSync } from 'fs';

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
