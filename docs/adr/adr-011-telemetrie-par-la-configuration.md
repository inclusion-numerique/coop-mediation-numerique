# ADR-011 : Télémétrie isolée dans la configuration

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                         |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-24 | Marc Gavanier | Premier appel optionnel `Sentry.captureException?.(…)`, dans le nettoyage des contacts Brevo (`4b2bdd4fd`)                                     |
| 2026-07-10 | Marc Gavanier | `Sentry.captureException` plante hors de Next et masque l'erreur réelle d'un job RDV Service Public ; appels passés en optionnel (`4e8ed3bf6`) |
| 2026-07-15 | Marc Gavanier | Le `catch` de l'`actionBuilder` signale les exceptions, toujours par un appel optionnel (`0dcc2b806`)                                          |
| 2026-11-16 | Marc Gavanier | Le signalement passe par `configuration/telemetry` ; seul ce dossier importe `@sentry/nextjs` ; variantes par `ENV` (`9867fe801`, #731)        |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                      |

## Statut

Accepté — en place depuis #731.

## Contexte

`@sentry/nextjs` était importé directement partout : features, librairies, adaptateurs, routes,
jobs, composants. Juste avant #731, une quarantaine de fichiers l'importaient. Deux problèmes en
découlaient.

**Le comportement dépendait du contexte d'exécution.** Sous Next.js, `Sentry.captureException`
est une fonction. Importé en ESM pur sous Node, par exemple un job lancé en local par la CLI avec
`tsx`, il vaut `undefined`. L'appel levait alors un `TypeError` dans le `catch`, qui écrasait
l'erreur d'origine et faisait planter le job. Début juillet 2026, un job de synchronisation RDV
Service Public en local échouait ainsi sur `Sentry.captureException is not a function`, qui
masquait la vraie cause : un nom d'hôte non résolu. La parade fut d'écrire
`Sentry.captureException?.(…)` partout. Elle évitait le plantage, mais une erreur pouvait alors
disparaître sans laisser de trace.

**Les tests devaient remplacer Sentry.** Un module qui importe Sentry ne se teste qu'en remplaçant
ce module globalement. Cela va contre la règle des tests du dépôt : ni mock de module, ni espion.

## Décision

### Un seul dossier importe Sentry

Seul `apps/web/src/configuration/telemetry` importe `@sentry/nextjs`. Son initialisation y vit
aussi. Le reste de l'application dépend d'interfaces fournies par `@arckit/telemetry` :
`errorReporter`, `signaler`, `instrument`.

### Une implémentation par environnement, choisie par `ENV`

Chaque module de `configuration/telemetry` a trois variantes :

- `index.prod.ts` : Sentry ;
- `index.dev.ts` : la console ;
- `index.ephemeral.ts` : rien, pour la CI.

`pnpm -F web generate:implementations` (`apps/web/scripts/generate-implementations.sh`) copie la
variante nommée par `ENV` (par défaut `dev`) vers `index.ts`, que git ignore. Le `postinstall`
génère `dev`, la CI fixe `ENV: ephemeral` (`ci.yml`), et le build régénère `prod`
(`build.reusable.yml`).

### Qui prend le reporter, qui le reçoit

Les racines de composition (`app/`, jobs, `auth`) et les modules `implementation/` prennent
`errorReporter` ou `signaler` dans la configuration. Le domaine, les commandes, la logique d'UI et
les librairies reçoivent ce dont ils ont besoin par injection.

L'`actionBuilder` reçoit le reporter en option. `configuration/nextjs` le compose avec celui de la
configuration (ADR-006).

### Les appels externes sont instrumentés à un seul endroit

Un appel à un service externe est enveloppé par `instrument` dans `configuration/<service>`. Pour
la Base Adresse Nationale, c'est `configuration/ban`. Un échec y est signalé une fois ; les
features qui l'appellent n'ont plus à le signaler elles-mêmes.

### Détail normatif

`AGENTS.md`, section « Telemetry ». Les tests injectent des dépendances écrites à la main et
vérifient des résultats, sans mock ni espion (DV-7 dans `.claude/conventions/feature-architecture.md`).

## Alternatives écartées

### Garder l'appel optionnel `captureException?.()`

Il empêchait le plantage hors de Next, mais au prix d'un signalement perdu sans bruit. Et il
laissait Sentry importé partout, donc remplacé partout dans les tests.

## Conséquences

Positives :

- Un job lancé hors de Next ne peut plus planter sur Sentry : en développement, l'erreur va à la
  console.
- Les tests n'ont plus à remplacer Sentry. Avec #731, toute la suite est passée sous Vitest, sans
  isolation ni mock.
- La CI n'envoie rien à Sentry.
- Changer d'outil de signalement ne touche que `configuration/telemetry`.

Négatives :

- `index.ts` n'existe pas dans un clone neuf tant que `generate:implementations` n'a pas tourné.
  Le `postinstall` le fait ; un `ENV` mal positionné au build livrerait la mauvaise variante.
- Le module `logger` d'`@arckit/telemetry` importe `pino` d'office, alors qu'il le déclare comme
  dépendance paire optionnelle : `pino` a dû rejoindre les dépendances du web.
- Retirer Sentry de la chaîne de types a privé `packages/fixtures` des types globaux de Next, qui
  lui arrivaient par Sentry : `next` a rejoint ses dépendances.
- Au 17/11/2026, quelques modules hors des racines de composition et des `implementation/`
  importent encore le reporter directement : `libraries/registre-personne`,
  `utils/addMutationLog.ts`, `components/ServerError.tsx`, des clients de `external-apis/brevo`
  et `data/data-inclusion`, et un composant d'UI de `features/activites`.

## Références

- `apps/web/src/configuration/telemetry/`
- `apps/web/src/configuration/ban/index.ts`
- `apps/web/scripts/generate-implementations.sh`
- `apps/web/src/instrumentation.ts`, `apps/web/src/instrumentation-client.ts`

## ADR liés

- [ADR-006 : Server actions et injection, à la place de tRPC](./adr-006-server-actions-et-injection.md)
- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./adr-008-strategie-de-tests.md)
