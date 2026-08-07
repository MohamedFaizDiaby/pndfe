import * as esbuild from 'esbuild';

const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'public',
  jsx: 'automatic',
  define: {
    __API_URL__: JSON.stringify(apiUrl),
  },
  sourcemap: true,
  target: ['es2020'],
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  logLevel: 'info',
});

await ctx.watch();

const port = 5190;
const { host } = await ctx.serve({ servedir: 'public', port });

console.log(`\nPNDFE - Front-end de developpement disponible sur http://localhost:${port}\n`);
