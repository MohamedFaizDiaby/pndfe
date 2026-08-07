# PNDFE — Rapport de sécurité et de solidité (Étape 4)

**Date** : 7 août 2026
**Périmètre** : backend NestJS + frontend React du MVP PNDFE (Étapes 1 à 3 + mise en relation)
**Réalisé par** : revue interne (Claude), en autonomie sur le code de ce dépôt

> ⚠️ **Avertissement** : le cahier des charges original prévoit un audit par des
> **experts indépendants** et un **système de surveillance/alerte actif en
> permanence**. Ce document n'est **pas** cet audit tiers — c'est une revue de
> sécurité auto-réalisée sur le code existant, avec tests exécutés localement.
> Il constitue une base de travail sérieuse, pas un certificat. Une mise en
> production réelle doit passer par un audit indépendant (pentest, revue de
> code par un tiers) avant ouverture au public.

## 1. Ce qui a été mis en place

### 1.1 Journal d'audit (traçabilité)

Un modèle `JournalAudit` enregistre chaque action sensible : connexions
(réussies et échouées), inscriptions, traitement des agréments, création/
signature/refus de contrat, paiements, création d'offres et candidatures.
Chaque entrée conserve l'utilisateur (dénormalisé, indépendant du cycle de
vie des autres tables), l'action, l'entité concernée, un contexte JSON libre
et l'adresse IP quand disponible. Consultable par le Ministère via
`GET /admin/journal` (filtrable par type d'action) et une page dédiée du
tableau de bord.

### 1.2 Limitation de débit (anti brute-force)

`@nestjs/throttler` est actif globalement (120 requêtes/minute/IP par défaut)
avec une limite renforcée sur `/auth/*` (10 requêtes/minute/IP), pour limiter
les attaques par force brute sur les mots de passe et le spam d'inscription.
**Vérifié en conditions réelles** (voir §3.2).

### 1.3 Endpoint de santé

`GET /health` vérifie la connexion à la base de données et expose le temps
de fonctionnement, pour un usage par un système de supervision externe
(non fourni ici — voir limites en §4).

### 1.4 Corrections issues de la revue de code

| # | Constat | Correction |
|---|---|---|
| 1 | CORS configuré avec `origin: true` : reflète **n'importe quelle origine** avec `credentials: true`. | Restreint à l'origine du frontend (`FRONTEND_URL`, avec repli sur `localhost:5190` en dev). |
| 2 | Le filtre de type de fichier (`imageFileFilter`) était défini mais **jamais appliqué** aux uploads (photo, pièce d'identité, documents d'agence) : n'importe quel type de fichier pouvait être envoyé. | Filtre appliqué sur les 3 endpoints d'upload (`register/travailleur`, `register/agence`). |
| 3 | Aucune limite de taille sur les fichiers uploadés (risque de saturation disque). | Limite de 5 Mo par fichier ajoutée. |
| 4 | Aucune traçabilité des actions sensibles. | Journal d'audit (§1.1). |
| 5 | Aucune protection contre le brute-force sur `/auth/login`. | Rate limiting (§1.2). |

Points déjà corrects, vérifiés sans modification nécessaire :
- Les mots de passe sont hashés (bcrypt, 10 rounds), jamais journalisés.
- Les requêtes de vérification de propriété (contrats, paiements, offres)
  n'exposent jamais `passwordHash` — vérifié explicitement méthode par
  méthode (un risque de ce type avait été détecté et corrigé pendant le
  développement de l'Étape 2).
- `ValidationPipe({ whitelist: true })` supprime les champs non déclarés des
  requêtes entrantes, ce qui limite le risque d'assignation de masse.
- Prisma (requêtes paramétrées) élimine le risque d'injection SQL classique ;
  aucune requête SQL brute non paramétrée n'est utilisée (`$queryRaw` du
  health-check ne contient aucune interpolation).
- Pas d'usage de `dangerouslySetInnerHTML` côté frontend (protection XSS par
  défaut de React).
- Le QR Code public de vérification d'identité n'expose que des champs non
  sensibles (nom, métier, photo, statut) — jamais la pièce d'identité ou le
  téléphone.

## 2. Découverte notable pendant les tests : port bloqué par les navigateurs

En préparant le test de charge, le script Node a échoué avec l'erreur
`bad port` sur le port **4190**, initialement choisi pour le backend. Ce port
correspond au protocole ManageSieve (RFC 5804) et figure sur la liste des
« ports interdits » du standard Fetch, appliquée par Node.js (`undici`) et,
selon les versions, par les navigateurs eux-mêmes. **Le backend a été déplacé
sur le port 4300** (vérifié non bloqué) et toute la configuration mise à jour
en conséquence.

C'est exactement le type de problème que les tests de l'Étape 4 sont censés
détecter avant l'ouverture au public — un choix de port anodin en apparence
aurait pu rendre la plateforme inutilisable pour une partie des utilisateurs
en production.

## 3. Résultats des tests de résistance

Script : `backend/scripts/load-test.mjs`, exécuté localement contre le
backend en développement (Node/SQLite sur un seul poste — non représentatif
d'une infrastructure de production avec PostgreSQL et plusieurs instances).

### 3.1 Concurrence — 1000 requêtes simultanées sur `GET /health`

| Métrique | Résultat |
|---|---|
| Requêtes réussies | 1000 / 1000 (100%) |
| Débit | ≈ 1547 req/s |
| Latence moyenne | 475 ms |
| Latence p50 / p95 / p99 | 495 / 500 / 501 ms |

Aucune requête échouée ni timeout sous une charge de 1000 connexions
simultanées. La latence élevée et resserrée (p50 ≈ p99) est cohérente avec
un serveur Node mono-processus absorbant une rafale de connexions sur un
seul cœur — un déploiement de production répartirait la charge sur plusieurs
instances derrière un load balancer.

### 3.2 Vérification du rate limiting — 15 tentatives rapides sur `POST /auth/login`

| Métrique | Résultat |
|---|---|
| Requêtes traitées (401 - identifiants invalides) | 10 / 15 |
| Requêtes rejetées (429 - trop de requêtes) | 5 / 15 |

Comportement conforme à la configuration (limite de 10/minute) : la
protection anti brute-force fonctionne comme prévu.

## 4. Limites assumées (hors périmètre de cette revue)

- **Pas d'audit tiers indépendant** ni de certification — voir avertissement
  en tête de document.
- **Pas de surveillance/alerte 24h/24** en production — nécessiterait un
  outil dédié (ex. Sentry, Datadog) non déployé dans cet environnement de
  développement local.
- **Stockage des fichiers uploadés** (photos, pièces d'identité) sur disque
  local, servi publiquement via une URL à jeton UUID non authentifiée :
  raisonnable pour une démo, mais un stockage objet chiffré avec accès
  authentifié est recommandé avant mise en production (déjà noté dans le
  README).
- **Secret JWT et mot de passe administrateur** par défaut, à changer avant
  toute mise en production (déjà noté dans le README).
- **Politique de mot de passe minimale** (6 caractères) — à renforcer selon
  la politique de sécurité retenue par le Ministère.
- **Jetons JWT longue durée (7 jours)** sans rotation/refresh token — un
  mécanisme de rafraîchissement à courte durée de vie serait préférable en
  production.
- **`NODE_ENV`** non positionné à `production` dans cet environnement de
  développement.

## 5. Conclusion

Les correctifs identifiés lors de cette revue ont été appliqués et vérifiés.
La plateforme dispose désormais d'une traçabilité complète des actions
sensibles et d'une protection anti brute-force active, deux exigences
explicites du cahier des charges pour cette étape. Les tests de charge
montrent un comportement stable sous 1000 requêtes concurrentes en
environnement de développement. Une validation par un audit de sécurité
indépendant reste nécessaire avant toute ouverture publique, conformément au
cahier des charges original.
