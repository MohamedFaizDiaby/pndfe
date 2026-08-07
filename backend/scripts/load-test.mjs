// Test de charge / resilience pour PNDFE (Etape 4 - Securite et solidite).
//
// Deux mesures distinctes, volontairement separees :
//  1) Concurrence brute sur /health (exempte de rate limiting) : mesure la
//     capacite du serveur a absorber un grand nombre de requetes simultanees.
//  2) Verification du rate limiting sur /auth/login : confirme que la
//     protection anti brute-force rejette bien l'exces de requetes (429)
//     plutot que de les traiter ou de planter.
//
// Usage: node scripts/load-test.mjs [baseUrl] [concurrence]

const baseUrl = process.argv[2] || 'http://localhost:4300';
const concurrence = parseInt(process.argv[3] || '1000', 10);

function percentile(sorted, p) {
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function testConcurrence() {
  console.log(`\n=== Test 1 : ${concurrence} requetes concurrentes sur GET /health ===`);
  const debut = performance.now();
  const latences = [];
  let succes = 0;
  let echecs = 0;

  const requetes = Array.from({ length: concurrence }, async () => {
    const t0 = performance.now();
    try {
      const res = await fetch(`${baseUrl}/health`);
      latences.push(performance.now() - t0);
      if (res.ok) succes++;
      else echecs++;
    } catch {
      latences.push(performance.now() - t0);
      echecs++;
    }
  });

  await Promise.all(requetes);
  const dureeTotale = performance.now() - debut;
  latences.sort((a, b) => a - b);

  console.log(`Duree totale        : ${dureeTotale.toFixed(0)} ms`);
  console.log(`Requetes reussies   : ${succes} / ${concurrence}`);
  console.log(`Requetes echouees   : ${echecs} / ${concurrence}`);
  console.log(`Debit               : ${(concurrence / (dureeTotale / 1000)).toFixed(1)} req/s`);
  console.log(`Latence min/moy/max : ${latences[0].toFixed(1)} / ${(latences.reduce((a, b) => a + b, 0) / latences.length).toFixed(1)} / ${latences[latences.length - 1].toFixed(1)} ms`);
  console.log(`Latence p50/p95/p99 : ${percentile(latences, 50).toFixed(1)} / ${percentile(latences, 95).toFixed(1)} / ${percentile(latences, 99).toFixed(1)} ms`);

  return { succes, echecs, dureeTotale, latences };
}

async function testRateLimiting() {
  console.log(`\n=== Test 2 : verification du rate limiting sur POST /auth/login (15 tentatives rapides) ===`);
  let statut200a401 = 0;
  let statut429 = 0;
  const statuts = [];

  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-charge@pndfe.ci', password: 'mauvais-mot-de-passe' }),
    });
    statuts.push(res.status);
    if (res.status === 429) statut429++;
    else statut200a401++;
  }

  console.log(`Codes de reponse    : ${statuts.join(', ')}`);
  console.log(`Traitees (401 etc.) : ${statut200a401} / 15`);
  console.log(`Rejetees (429)      : ${statut429} / 15`);
  console.log(
    statut429 > 0
      ? 'Resultat : le rate limiting est actif et rejette bien l\'exces de tentatives.'
      : 'Resultat : ALERTE — aucune requete rejetee, le rate limiting ne semble pas actif.',
  );

  return { statut429, statuts };
}

async function main() {
  console.log(`Cible : ${baseUrl}`);
  const resConcurrence = await testConcurrence();
  const resRateLimit = await testRateLimiting();

  console.log('\n=== Resume ===');
  const tauxSucces = ((resConcurrence.succes / concurrence) * 100).toFixed(1);
  console.log(`- ${concurrence} requetes concurrentes : ${tauxSucces}% de succes, latence p95 = ${percentile(resConcurrence.latences, 95).toFixed(1)} ms`);
  console.log(`- Rate limiting sur /auth/login : ${resRateLimit.statut429 > 0 ? 'OK (actif)' : 'ECHEC (inactif)'}`);
}

main().catch((err) => {
  console.error('Erreur pendant le test de charge :', err);
  process.exit(1);
});
