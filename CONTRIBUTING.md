# Guide de contribution

## 📑 Table des matières

- 📦 [Prérequis](#prerequis)
- 🚀 [Installer l'environnement de développement](#installer)
- 🛠️ [Commandes disponibles](#commandes)
- 🧪 [Tests](#tests)
- 🤝 [Pratiques du dépôt](#pratiques)
- 🗃️ [Base de données](#base-de-donnees)
- ⏱️ [Tâches](#taches)
- 🔄 [Intégration et déploiement continus](#ci-cd)
- 🔐 [Sécurité](#securite)
- 🏗️ [Technologies utilisées](#technologies)

<h2 id="prerequis">📦 Prérequis</h2>

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/), dans la version indiquée par `engines.node` du `package.json`
- [pnpm](https://pnpm.io/) : il installe de lui-même la version indiquée par `packageManager` du `package.json`
  - pnpm refuse d'installer une version publiée depuis moins de 15 jours (`minimumReleaseAge` dans `pnpm-workspace.yaml`) : une dépendance toute récente attend, ou s'ajoute aux exclusions de ce fichier pour sa seule version
- [Docker](https://www.docker.com/) avec Docker Compose, pour la base de données et la messagerie locales
- [gitleaks](https://github.com/gitleaks/gitleaks#installing) : le hook de pré-commit l'exécute et refuse le commit s'il est absent
- [OpenTofu](https://opentofu.org/docs/intro/install/), seulement pour lire un plan d'infrastructure en local

<h2 id="installer">🚀 Installer l'environnement de développement</h2>

### 1. Cloner le dépôt et installer les dépendances

```bash
git clone git@github.com:inclusion-numerique/coop-mediation-numerique.git
cd coop-mediation-numerique
pnpm install
```

L'installation génère aussi le client Prisma.

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Les valeurs marquées `<secret>` ne sont jamais versionnées. Avec une clé Scaleway personnelle (`SCW_ACCESS_KEY` et `SCW_SECRET_KEY`, à demander à l'équipe), cette commande les ajoute au `.env` depuis le Secret Manager de Scaleway :

```bash
pnpm cli dotenv:from-secrets
```

Elle ajoute aussi les identifiants SMTP du Secret Manager, qui remplacent ceux de MailDev : retirez du `.env` les lignes `SMTP_*` qu'elle a ajoutées pour que les e-mails restent interceptés en local.

En local, la connexion passe par l'environnement d'intégration de ProConnect : elle demande `PROCONNECT_LOCAL_CLIENT_SECRET`.

### 3. Démarrer la base de données et la messagerie

```bash
pnpm docker:start
```

- **PostgreSQL**, avec les extensions de la Coop et de l'Entrepôt (`docker/postgres`) : `localhost:5433`, utilisateur `coop-mediation-numerique`, mot de passe `password`
- **MailDev**, qui intercepte les e-mails envoyés : interface sur http://localhost:1080, SMTP sur le port 1025 (utilisateur `mailuser`, mot de passe `mailpassword`)

### 4. Initialiser la base de données

```bash
pnpm db:init
pnpm fixtures:load
```

`db:init` génère le client Prisma et applique les migrations ; c'est aussi la commande à relancer après avoir récupéré de nouvelles migrations. `fixtures:load` charge un jeu de données de test, et refuse de viser la base de production.

### 5. Lancer l'application

```bash
pnpm dev
```

L'application répond sur http://localhost:3000. `pnpm storybook` lance Storybook sur http://localhost:6006.

<h2 id="commandes">🛠️ Commandes disponibles</h2>

| Commande                               | Rôle                                                                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                             | Lance l'application en développement                                                                                                                                          |
| `pnpm storybook`                       | Lance Storybook                                                                                                                                                               |
| `pnpm lint`                            | Vérifie le code avec Biome, puis la spécification OpenAPI                                                                                                                     |
| `pnpm lint:fix`                        | Corrige le format et les erreurs que Biome sait corriger                                                                                                                      |
| `pnpm lint:adr`                        | Vérifie le format MADR des ADR de `docs/decisions`                                                                                                                            |
| `pnpm tsc`                             | Vérifie les types                                                                                                                                                             |
| `pnpm test`                            | Lance les tests unitaires                                                                                                                                                     |
| `pnpm build`                           | Construit l'application pour la production                                                                                                                                    |
| `pnpm docker:start` / `docker:stop`    | Démarre ou arrête PostgreSQL et MailDev                                                                                                                                       |
| `pnpm docker:reset`                    | Supprime la base locale, la recrée et la réinitialise                                                                                                                         |
| `pnpm db:init`                         | Génère le client Prisma et applique les migrations                                                                                                                            |
| `pnpm prisma:generate-migration <nom>` | Crée une migration à partir du schéma Prisma                                                                                                                                  |
| `pnpm fixtures:load`                   | Charge les données de test                                                                                                                                                    |
| `pnpm lint:commit`                     | Vérifie les messages des commits de la branche depuis `main`                                                                                                                  |
| `pnpm cli <commande>`                  | Lance un outil du CLI : `pnpm cli --help` les liste                                                                                                                           |
| `pnpm api-v1-doc:generate`             | Régénère la spécification OpenAPI de l'API v1, que la CI vérifie à jour                                                                                                       |
| `pnpm api:bruno`                       | Génère dans `.bruno` une collection [Bruno](https://www.usebruno.com/) de l'API v1, à partir de sa spécification ; le jeton se saisit dans Bruno, en variable secrète `token` |

<h2 id="tests">🧪 Tests</h2>

| Commande                | Tests                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| `pnpm test`             | Unitaires, avec [Vitest](https://vitest.dev/)                          |
| `pnpm test:integration` | Intégration, contre la base de `DATABASE_URL`                          |
| `pnpm test:cucumber`    | Scénarios métier, avec [Cucumber](https://cucumber.io/)                |
| `pnpm test:e2e`         | De bout en bout, avec [Cypress](https://www.cypress.io/), en interface |
| `pnpm cy run`           | De bout en bout, sans interface                                        |

- Les tests n'utilisent ni mock ni espion : ils injectent des dépendances écrites à la main et vérifient les valeurs retournées.
- Les tests d'intégration et les scénarios Cucumber écrivent dans la base : lancez-les sur une base jetable, jamais sur une base qui contient des données utiles. La CI les joue sur une base neuve à chaque exécution.
- Les tests de bout en bout demandent un serveur lancé avec `IS_E2E=true` (`IS_E2E=true pnpm dev`), qui remplace l'API Dataspace par un simulateur.

<h2 id="pratiques">🤝 Pratiques du dépôt</h2>

### Branches

- Partir de `main` à jour, et mettre une branche à jour par rebase, jamais par fusion.
- Préfixer la branche selon la nature du changement : `build/`, `chore/`, `ci/`, `docs/`, `feat/`, `fix/`, `perf/`, `refactor/`, `revert/`, `style/` ou `test/`. Seules ces branches déclenchent la CI.

### Commits

- Les messages suivent les [Commits Conventionnels](https://www.conventionalcommits.org/fr), vérifiés par commitlint au commit (hook `commit-msg`) et en CI (check « Lint commits »).
- Les commits sont signés avec une clé GPG ; la [documentation GitHub](https://docs.github.com/fr/authentication/managing-commit-signature-verification) explique comment configurer la signature.
- Au commit, le hook de pré-commit formate les fichiers indexés avec Biome et cherche des secrets avec gitleaks. Ne jamais le contourner (`--no-verify`).

### Pull requests

- Une PR vise `main` et se fusionne par « Squash and merge » : son titre devient le message du commit, il suit donc lui aussi les Commits Conventionnels (check « Lint PR title »).
- Les checks Lint, Lint commits, Lint PR title, Test web, Integration tests, Cucumber, Components, E2E 0, 1 et 2 et Dependency review doivent passer pour fusionner.
- La fusion dans `main` déploie l'environnement `dev`, puis la production si `dev` a réussi.

### Code

Les conventions d'architecture (features, abilities, domaine, server actions) et de style sont décrites dans [AGENTS.md](./AGENTS.md). Les décisions structurantes sont consignées dans les [ADR](./docs/decisions).

<h2 id="base-de-donnees">🗃️ Base de données</h2>

1. Modifier le schéma dans `prisma/schema.prisma`.
2. Générer la migration : `pnpm prisma:generate-migration nom_de_la_migration`.
3. Relire le SQL généré dans `prisma/migrations/`.

En production, la base de la Coop est le schéma `coop` de l'Entrepôt de données de l'inclusion numérique, joignable seulement par un bastion SSH (voir [l'infrastructure](./infrastructure/README.md)). Toute migration, tout backfill et tout script SQL qui touche `coop.lieu_inclusion` passe par l'application ou se signale à l'équipe Dataspace, parce que la Coop écrit aussi dans le registre de l'Entrepôt ([ADR-003](./docs/decisions/0003-registre-des-lieux-entrepot.md)).

<h2 id="taches">⏱️ Tâches</h2>

Les tâches de fond vivent dans `src/jobs/`. Chacune a un nom, une charge utile validée par Zod et un exécuteur, rangés dans `src/jobs/<tâche>/` : `<tâche>.job.ts` (nom et charge utile) et `<tâche>.execution.ts` (exécuteur). Chaque exécution est tracée dans la table `job_executions`.

```bash
pnpm jobs:run <tâche> '<charge utile JSON>'
```

| Tâche                             | Rôle                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `sync-rdvsp-data`                 | Synchronise les rendez-vous depuis RDV Service Public                          |
| `inactive-users-reminders`        | Relance par e-mail les inscriptions inachevées                                 |
| `anonymiser-les-comptes-inactifs` | Anonymise les comptes inactifs ; `{"simuler": true}` pour un passage à blanc   |
| `retirer-les-roles-vacants`       | Retire le rôle jamais utilisé d'un double rôle inscrit depuis plus de 30 jours |
| `synchroniser-les-roles-brevo`    | Recalcule les rôles Brevo des inscrits et les envoie                           |
| `remove-orphan-brevo-contacts`    | Supprime les contacts Brevo qui n'ont plus de compte                           |

Le planning des tâches qui tournent seules est décrit dans [l'infrastructure](./infrastructure/README.md#taches-planifiees). Une tâche n'a sa place ici que tant qu'elle a une raison de tourner : une reprise de données ou un correctif ponctuel disparaît une fois passé, sa trace reste dans `job_executions` et dans l'historique git.

<h2 id="ci-cd">🔄 Intégration et déploiement continus</h2>

Les workflows GitHub Actions sont dans `.github/workflows/` :

- **CI** : lint, tests unitaires, d'intégration, Cucumber, Cypress, Chromatic, contrôle du bundle des tâches, revue des dépendances et, quand `infrastructure/` change, plan d'infrastructure, sur les branches préfixées et sur `main`. Sur `main`, ils publient la documentation technique, avec la couverture agrégée des tests, et tiennent à jour les captures de référence de Chromatic.
- **PR title** : vérifie que le titre d'une PR suit les Commits Conventionnels, puisqu'il devient le message du commit de fusion.
- **Preview** : poser le label `preview` sur une PR déploie l'environnement de sa branche, et chaque push le redéploie. Retirer le label, fermer ou fusionner la PR le détruit.
- **Release** : à chaque fusion dans `main`, construit les images et déploie `dev` puis la production.
- **Remove ephemeral environment** : détruit l'environnement de preview d'une branche.
- **Postgres CI image** : publie l'image PostgreSQL de la CI (`docker/postgres-ci`).
- **security.txt** : chaque lundi, valide le `security.txt` de la production selon la RFC 9116 avec [sectxt](https://github.com/DigitalTrustCenter/sectxt), et échoue s'il expire dans moins de 30 jours. L'échec est notifié par e-mail à l'auteur du dernier changement de son planning.

Le détail du déploiement et de l'approbation des changements d'infrastructure est dans [l'infrastructure](./infrastructure/README.md#deploiement).

<h2 id="securite">🔐 Sécurité</h2>

Tout incident de sécurité, ou toute vulnérabilité découverte, se signale et se traite selon la [Procédure de Réponse et Signalement des Incidents de Sécurité (PRIS)](https://docs.numerique.gouv.fr/docs/e8f1a2d1-3a6c-4e52-9ffd-639d772e76e7/), réservée aux agents connectés à Docs. Voir aussi [SECURITY.md](./SECURITY.md).

<h2 id="technologies">🏗️ Technologies utilisées</h2>

### Application

- [TypeScript](https://www.typescriptlang.org/), [React 19](https://react.dev/) et [Next.js 16](https://nextjs.org/) (App Router)
- [Système de Design de l'État](https://www.systeme-de-design.gouv.fr/), avec [react-dsfr](https://react-dsfr.codegouv.studio/)
- [Prisma](https://www.prisma.io/) et [PostgreSQL](https://www.postgresql.org/)
- [Zod](https://zod.dev/) pour la validation, [TanStack Form](https://tanstack.com/form) et [React Hook Form](https://react-hook-form.com/) pour les formulaires
- [NextAuth.js](https://next-auth.js.org/) avec [ProConnect](https://www.proconnect.gouv.fr)
- [MJML](https://mjml.io/) et [Nodemailer](https://nodemailer.com/) pour les e-mails
- [Recharts](https://recharts.org/) pour les graphiques

### Outils

- [pnpm](https://pnpm.io/), [Biome](https://biomejs.dev/), [Husky](https://typicode.github.io/husky/), [lint-staged](https://github.com/lint-staged/lint-staged), [commitlint](https://commitlint.js.org/) et [gitleaks](https://github.com/gitleaks/gitleaks)
- [Vitest](https://vitest.dev/), [Cucumber](https://cucumber.io/), [Cypress](https://www.cypress.io/), [Storybook](https://storybook.js.org/) et [Chromatic](https://www.chromatic.com/)
- [Sentry](https://sentry.io/) pour le suivi des erreurs, [Matomo](https://matomo.org/) pour la mesure d'audience

### Infrastructure

- [Scaleway](https://www.scaleway.com/), décrite avec [OpenTofu](https://opentofu.org)
- [GitHub Actions](https://docs.github.com/fr/actions) et [Docker](https://www.docker.com/)
