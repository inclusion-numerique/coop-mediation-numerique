# Guide de Contribution

## Table des matieres

- [Contexte du projet](#contexte-du-projet)
- [Architecture du monorepo](#architecture-du-monorepo)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Lancer le projet](#lancer-le-projet)
- [Commandes CLI](#commandes-cli)
- [CLI (`apps/cli`)](#cli-appscli)
- [Jobs](#jobs)
- [Infrastructure Terraform](#infrastructure-terraform)
- [Procedures de contribution](#procedures-de-contribution)
- [Stack technique](#stack-technique)

---

## Contexte du projet

**La Coop de la mediation numerique** est une plateforme web destinee aux professionnels de la mediation numerique. Elle est developpee par le Pole Inclusion numerique de l'ANCT (Agence Nationale de la Cohesion des Territoires).

La plateforme permet aux mediateurs numeriques de :

- Gerer leurs activites et beneficiaires
- Consulter et administrer les structures de mediation numerique
- Acceder a un annuaire des acteurs de la mediation numerique
- Gerer des equipes de mediateurs
- Planifier des rendez-vous via l'integration avec RDV Service Public
- Utiliser un assistant IA pour accompagner leur travail
- Consulter des statistiques sur leurs activites

### Environnements

| Environnement | URL |
|---|---|
| Production | https://coop-numerique.anct.gouv.fr |
| Developpement | https://dev.coop-mediation-numerique.incubateur.anct.gouv.fr |
| MailDev (emails de test) | http://maildev.coop-numerique.anct.gouv.fr |

### Authentification

L'application supporte deux modes d'authentification :
- **Magic link** : connexion par lien magique envoye par email
- **ProConnect** : SSO du gouvernement francais (anciennement AgentConnect)

### Roles utilisateurs

- **User** : utilisateur standard
- **Support** : acces aux outils de support
- **Admin** : acces complet a l'administration
- Profils metier : ConseillerNumerique, Mediateur, Coordinateur

---

## Architecture du monorepo

Le projet est organise en monorepo avec pnpm workspaces et Turborepo :

```
coop-mediation-numerique/
├── apps/
│   ├── cli/                 # Outils CLI (scripts, deploiement, traitements)
│   └── web/                 # Application Next.js principale
│       ├── src/
│       │   ├── app/         # Pages Next.js (App Router)
│       │   │   ├── (public)/    # Pages publiques (sans auth)
│       │   │   ├── (private)/   # Pages protegees (auth requise)
│       │   │   └── api/         # Routes API (tRPC + REST)
│       │   ├── assistant/   # Fonctionnalites assistant IA
│       │   ├── auth/        # Logique d'authentification
│       │   ├── beneficiaire/# Gestion des beneficiaires
│       │   ├── components/  # Composants React
│       │   ├── external-apis/# Integrations API externes
│       │   ├── jobs/        # Taches planifiees
│       │   ├── server/      # Logique serveur & procedures tRPC
│       │   └── prisma/      # Schema et migrations Prisma
│       └── prisma/
│           └── migrations/  # Fichiers de migration SQL
├── packages/
│   ├── cdk/                 # Infrastructure as Code (CDKTF/Terraform)
│   ├── config/              # Configuration partagee (constantes, domaines)
│   ├── e2e/                 # Tests end-to-end (Cypress)
│   ├── emails/              # Templates d'emails (MJML + React)
│   ├── fixtures/            # Donnees de test et seed
│   ├── lint/                # Configuration Biome/ESLint
│   ├── storybook/           # Documentation des composants UI
│   ├── test/                # Configuration Jest partagee
│   └── ui/                  # Composants UI partages (DSFR)
├── docs/                    # Documentation et ADR
├── docker/                  # Configuration Docker
├── .circleci/               # Pipeline CI/CD
├── .env.dist                # Template des variables d'environnement
└── docker-compose.dev.yml   # Services Docker pour le dev local
```

---

## Prerequis

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) version 22.5 minimum (recommande : utiliser [nvm](https://github.com/nvm-sh/nvm) ou [Volta](https://volta.sh/))
- [pnpm](https://pnpm.io/) version 10+
- [Docker](https://www.docker.com/) et Docker Compose (optionnel mais recommande)
- [PostgreSQL](https://www.postgresql.org/) (optionnel si Docker est utilise)

---

## Installation

### 1. Cloner le depot

```bash
git clone git@github.com:inclusion-numerique/coop-mediation-numerique.git
cd coop-mediation-numerique
```

### 2. Installer Node.js

```bash
nvm use --lts
```

### 3. Installer les dependances

```bash
pnpm install
```

### 4. Configurer les variables d'environnement

Creer le fichier `.env` a partir du template :

```bash
cp .env.dist .env
```

Editer `.env` avec vos valeurs locales. Les variables marquees `<secret>` doivent etre demandees a un membre de l'equipe, notamment :

- `PROCONNECT_LOCAL_CLIENT_SECRET` : pour l'authentification ProConnect en local
- `SCW_ACCESS_KEY` / `SCW_SECRET_KEY` : credentials Scaleway personnels
- `CONSEILLER_NUMERIQUE_MONGODB_URL` : acces a la base MongoDB Conseiller Numerique

### 5. Demarrer les services Docker

```bash
pnpm docker:start
```

Cela lance :
- **PostgreSQL** (avec pgvector) : `localhost:5433`, utilisateur `coop-mediation-numerique`, mot de passe `password`
- **MailDev** (intercepteur d'emails) : interface web sur http://localhost:1080, SMTP sur le port `1025`

### 6. Initialiser la base de donnees

```bash
pnpm db:init
```

Cette commande genere le client Prisma et applique toutes les migrations.

### 7. Charger les donnees de test (optionnel)

```bash
pnpm fixtures:load
```

Charge des donnees de test avec deux utilisateurs :
- **Edith Piaf** : `edith@piaf.com`
- **Georges Moustaki** : `georges@moustaki.com`

En developpement, un "Magic link" de connexion apparait dans la console du serveur Next.js.

### 8. Telecharger les lieux de la cartographie nationale (optionnel)

```bash
pnpm cli job:execute update-structures-cartographie-nationale
```

---

## Lancer le projet

### Demarrage rapide

```bash
pnpm docker:start    # Demarrer PostgreSQL + MailDev
pnpm db:init         # Initialiser la base
pnpm start:web       # Lancer le serveur de dev
```

L'application est disponible sur **http://localhost:3000**.

### Mode developpement complet

```bash
pnpm dev
```

Lance en parallele :
- **web** : http://localhost:3000
- **storybook** : http://localhost:6006

### Reinitialiser l'environnement

```bash
pnpm docker:reset    # Reset les conteneurs Docker et la base
pnpm db:init         # Reinitialiser les migrations
pnpm start:web       # Relancer le serveur
```

---

## Commandes CLI

### Commandes principales (racine)

| Commande | Description |
|---|---|
| `pnpm dev` | Lance toutes les apps en parallele (web + storybook) |
| `pnpm start:web` | Lance uniquement l'application web Next.js |
| `pnpm build` | Build de production de toutes les apps et packages |
| `pnpm lint` | Linting sur l'ensemble du monorepo |
| `pnpm tsc` | Verification des types TypeScript |
| `pnpm format` | Formatage du code avec Prettier |
| `pnpm test` | Execute tous les tests unitaires (Jest) |
| `pnpm test:integration` | Execute les tests d'integration |
| `pnpm test:e2e` | Ouvre l'interface Cypress pour les tests e2e |
| `pnpm cli` | Execute les outils CLI avec dotenv |
| `pnpm with-env <cmd>` | Execute une commande avec les variables d'env chargees |

### Base de donnees

| Commande | Description |
|---|---|
| `pnpm db:init` | Genere le client Prisma et applique les migrations |
| `pnpm prisma:generate-migration <nom>` | Cree une nouvelle migration a partir du schema Prisma |
| `pnpm fixtures:load` | Charge les donnees de test dans la base |
| `pnpm -F web prisma studio` | Ouvre Prisma Studio (interface graphique de la BDD) |

### Docker

| Commande | Description |
|---|---|
| `pnpm docker:start` | Demarre PostgreSQL + MailDev |
| `pnpm docker:stop` | Arrete les conteneurs Docker |
| `pnpm docker:reset` | Reinitialise la base de donnees et redemarre |

### Tests

| Commande | Description |
|---|---|
| `pnpm test` | Tests unitaires de tout le monorepo |
| `pnpm test:integration` | Tests d'integration (necessite Docker) |
| `pnpm test:e2e` | Tests e2e interactifs (Cypress UI) |
| `pnpm -F e2e cy run` | Tests e2e headless |
| `pnpm -F web test` | Tests unitaires de l'app web uniquement |

### Application web

| Commande | Description |
|---|---|
| `pnpm -F web dev` | Serveur de dev Next.js |
| `pnpm -F web build` | Build de production |
| `pnpm -F web build:analyze` | Build avec analyse du bundle |
| `pnpm -F web lint` | Lint avec Biome + linter OpenAPI |
| `pnpm -F web lint:fix` | Correction automatique du linting |
| `pnpm -F web api-v1-doc:generate` | Genere la spec OpenAPI v1 |
| `pnpm -F web standalone:configure` | Configure le build standalone |
| `pnpm -F web standalone:start` | Demarre le serveur standalone |

### Infrastructure (CDK)

| Commande | Description |
|---|---|
| `pnpm -F cdk synth` | Synthetise le code Terraform a partir du CDK |
| `pnpm -F cdk cdktf` | Acces direct au CLI CDKTF |
| `pnpm -F cdk output` | Recupere les outputs CDK |
| `pnpm -F cdk tf:web:backend-reconfigure` | Reconfigure le backend Terraform |

### Storybook

| Commande | Description |
|---|---|
| `pnpm -F storybook dev` | Demarre Storybook (http://localhost:6006) |
| `pnpm -F storybook build-storybook` | Build statique de Storybook |
| `pnpm -F storybook chromatic` | Deploie sur Chromatic (tests visuels) |

### Nettoyage

| Commande | Description |
|---|---|
| `pnpm clean` | Supprime `node_modules` a la racine |
| `pnpm clean:workspaces` | Supprime le cache Turbo |

---

## CLI (`apps/cli`)

L'application CLI (`pnpm cli <commande>`) fournit un ensemble d'outils pour le deploiement, la gestion d'infrastructure, les secrets et l'execution de jobs. Elle utilise [Commander.js](https://github.com/tj/commander.js/).

### Execution de jobs

| Commande | Description |
|---|---|
| `pnpm cli job:execute <name> [data]` | Execute un job en local. `data` est un payload JSON optionnel |
| `pnpm cli job:api:execute <name> [data]` | Execute un job via l'API d'un deploiement distant |

Exemples :
```bash
# Mettre a jour les structures depuis la cartographie nationale
pnpm cli job:execute update-structures-cartographie-nationale

# Backup de la base de donnees (avec payload)
pnpm cli job:execute backup-database '{"databaseName":"coop-mediation-numerique-main","type":"daily"}'
```

### Deploiement

| Commande | Description |
|---|---|
| `pnpm cli deployment:check-status <url>` | Verifie le statut de sante d'un deploiement |

### GitHub

| Commande | Description |
|---|---|
| `pnpm cli github:deployment:create <branch>` | Cree un deploiement GitHub pour une branche |
| `pnpm cli github:deployment:update <id> <state>` | Met a jour le statut d'un deploiement (`error`, `failure`, `inactive`, `in_progress`, `queued`, `pending`, `success`). Options : `--url`, `--log`, `--description` |
| `pnpm cli github:deployment:deactivate <branch>` | Desactive tous les deploiements GitHub d'une branche |

### Infrastructure

| Commande | Description |
|---|---|
| `pnpm cli dotenv:from-cdk <stack>` | Genere un `.env` a partir des outputs CDK (`web` ou `project`) |
| `pnpm cli dotenv:add-next-public <namespace>` | Ajoute les variables `NEXT_PUBLIC_*` au `.env`. Option : `--local` |
| `pnpm cli dotenv:from-secrets` | Recupere tous les secrets depuis Scaleway Secret Manager et peuple le `.env` |
| `pnpm cli terraform:vars-from-env <stack>` | Genere un fichier tfvars a partir des variables d'environnement (`web` ou `project`) |
| `pnpm cli infrastructure:create <resource> <names>` | Cree des ressources Scaleway (`database` ou `container`). Option : `--dry-run` |
| `pnpm cli infrastructure:delete-preview <branches>` | Declenche la suppression d'environnements de preview via CircleCI (branches separees par des virgules) |
| `pnpm cli infrastructure:inventory` | Affiche l'inventaire de l'infrastructure et permet le nettoyage interactif (branches, conteneurs, buckets, bases) |
| `pnpm cli backup:locally-restore-latest-main` | Restaure le dernier backup de la base `main` en local. Options : `--date <date>`, `--local`, `--list`, `--type <type>` |

### Secrets

| Commande | Description |
|---|---|
| `pnpm cli secrets:list` | Liste tous les noms de secrets disponibles |
| `pnpm cli secrets:get <name>` | Recupere la valeur d'un secret |
| `pnpm cli secrets:database:setup <namespace>` | Cree un secret de mot de passe base de donnees pour un namespace de preview |
| `pnpm cli secrets:database-password <namespace>` | Recupere le mot de passe base de donnees d'un namespace |

### RAG (Retrieval-Augmented Generation)

| Commande | Description |
|---|---|
| `pnpm cli rag:ingest-notion-help-center-exported-markdown` | Ingere les fichiers markdown exportes du centre d'aide Notion dans le systeme RAG (requiert les fichiers dans `/var/centre-aide-notion`) |

### Sentry

| Commande | Description |
|---|---|
| `pnpm cli sentry:delete-environment-issues <environment>` | Supprime toutes les issues Sentry d'un environnement et le masque de l'UI (interdit pour `main`) |

### Statistiques

| Commande | Description |
|---|---|
| `pnpm cli stats:fetch-accompagnements <conum> <date>` | Exporte les statistiques d'accompagnement par departement en CSV. `conum` : 0=mediateur, 1=conseiller numerique. `date` : date limite au format YYYY-MM-DD |

---

## Jobs

Les jobs sont des taches executables definies dans `apps/web/src/jobs/`. Chaque job possede un nom unique, un payload optionnel type avec Zod, et un executeur. Les jobs peuvent etre lances manuellement via le CLI (`pnpm cli job:execute <name>`) ou automatiquement via des crons Scaleway.

L'execution des jobs est tracee en base de donnees dans la table `jobExecution`.

### Liste des jobs

| Job | Payload | Description |
|---|---|---|
| `backup-database` | `{ databaseName, type: 'weekly' \| 'daily' \| 'hourly' }` | Sauvegarde de la base de donnees Scaleway. Retention : weekly=600j, daily=90j, hourly=4j |
| `update-structures-cartographie-nationale` | — | Telecharge et synchronise les structures depuis l'API de la cartographie nationale |
| `sync-users-from-dataspace` | — | Synchronise les donnees utilisateurs depuis l'API Dataspace |
| `sync-rdvsp-data` | — | Synchronise les donnees de rendez-vous depuis RDV Service Public |
| `fix-users-roles` | — | Corrige et repare les attributions de roles utilisateurs |
| `inactive-users-reminders` | — | Envoie des emails de relance aux utilisateurs avec des inscriptions incompletes |
| `remove-orphan-brevo-contacts` | — | Supprime les contacts Brevo qui n'existent plus en base de donnees |
| `normalize-structures-employeuses` | `{ dryRun?, minDaysSinceLastSync? }` | Normalise les donnees des structures employeuses (par defaut : sync si 7+ jours depuis la derniere) |
| `import-contacts-to-brevo` | — | Synchronise les contacts de la base de donnees vers la plateforme Brevo |
| `ingest-les-bases-in-rag` | — | Ingere la documentation "Les Bases" dans le systeme RAG pour l'assistant IA |
| `fix-structures` | — | Corrige et valide les donnees des structures (adresses, telephones, URLs, horaires) |
| `fix-users` | — | Corrige les numeros de telephone invalides des utilisateurs |
| `fix-tags` | — | Nettoie et corrige les donnees de tags |
| `set-servcies-to-shared-lieux` | — | Met a jour la configuration de partage des services pour les lieux partages |
| `update-lieux-activites-a-distance` | — | Met a jour les lieux d'activites marques comme "a distance" |

### Mecanisme d'execution des crons

1. **Scaleway Container Cron** declenche un POST vers le conteneur
2. Le middleware `jobTriggerMiddleware` detecte la requete interne (origine `svc.cluster.local`)
3. La requete est reecrite vers `/api/jobs` avec un token d'API interne
4. Le job est valide puis execute via `executeJob()`
5. Les details d'execution sont sauvegardes en base (`jobExecution`)

### Planning des crons

#### Production uniquement (`main`)

| Job | Schedule | Horaire |
|---|---|---|
| `backup-database` (hourly) | `0 * * * *` | Toutes les heures |
| `backup-database` (daily) | `0 0 * * *` | Tous les jours a 00:00 |
| `backup-database` (weekly) | `0 0 * * 0` | Tous les dimanches a 00:00 |
| `fix-users-roles` | `0 0 * * *` | Tous les jours a 00:00 |
| `inactive-users-reminders` | `0 0 * * *` | Tous les jours a 00:00 |
| `sync-users-from-dataspace` | `0 2 * * *` | Tous les jours a 02:00 |
| `remove-orphan-brevo-contacts` | `0 3 * * *` | Tous les jours a 03:00 |
| `normalize-structures-employeuses` | `0 4 * * *` | Tous les jours a 04:00 |

#### Dev et production (`dev` + `main`)

| Job | Schedule | Horaire |
|---|---|---|
| `sync-rdvsp-data` | `0 2 * * *` | Tous les jours a 02:00 |

#### Tous les environnements

| Job | Schedule | Horaire |
|---|---|---|
| `update-structures-cartographie-nationale` | `0 3 * * *` | Tous les jours a 03:00 |

---

## Infrastructure Terraform

L'infrastructure est entierement geree en **Infrastructure as Code** via [CDKTF](https://developer.hashicorp.com/terraform/cdktf) (CDK for Terraform en TypeScript). Le code se trouve dans `packages/cdk/src/`.

### Vue d'ensemble

L'hebergement est assure par **Scaleway** (cloud provider francais). Le CDK genere du code Terraform a partir de deux stacks TypeScript :

```
packages/cdk/src/
├── main.ts                    # Point d'entree : instancie les deux stacks
├── ProjectStack.ts            # Ressources partagees du projet
├── WebAppStack.ts             # Ressources par environnement/branche
├── MaildevInstance.ts         # Instance Scaleway pour MailDev
├── createJobExecutionCron.ts  # Utilitaire pour les crons de jobs
├── terraformBackend.ts        # Configuration du backend S3 pour l'etat Terraform
├── environmentVariable.ts     # Gestion des variables d'environnement Terraform
├── getCdkOutput.ts            # Typage des outputs CDK
├── output.ts                  # Helper pour les outputs Terraform
└── utils.ts                   # Utilitaires (namespace, DNS, URLs)
```

### Backend Terraform

L'etat Terraform est stocke dans un bucket S3 Scaleway :

- **Bucket** : `coop-mediation-numerique-terraform-state`
- **Endpoint** : `https://s3.fr-par.scw.cloud`
- **Fichiers d'etat** :
  - `coop-mediation-numerique-project.tfstate` (stack projet)
  - `coop-mediation-numerique-web-<namespace>.tfstate` (stack web par branche)

### ProjectStack — Ressources partagees

La `ProjectStack` (`ProjectStack.ts`) contient les ressources deployees une seule fois et partagees par tous les environnements :

#### Base de donnees managee

- **Type** : PostgreSQL 14 (Scaleway Managed Database)
- **Instance** : `db-pro2-s` en haute disponibilite (HA cluster)
- **Stockage** : SBS 15K, 60 Go, chiffrement au repos active
- **Backups** : automatiques toutes les 24h, retention de 14 jours
- **Configuration** : 500 connexions max, optimisations memoire/cache

#### Stockage objet (S3)

Deux buckets Scaleway Object Storage (compatible AWS S3) :

| Bucket | Usage |
|---|---|
| `coop-mediation-numerique-developer-unsafe-uploads` | Uploads fichiers (dev/integration) |
| `coop-mediation-numerique-backups` | Sauvegardes de bases de donnees |

Les deux buckets sont configures avec des regles CORS pour `localhost:3000`.

#### Registry Docker

- **RegistryNamespace** : registre d'images Docker Scaleway pour les builds de l'app web
- Nom : `coop-mediation-numerique-web-app`
- Region : `fr-par`

#### Container Namespace

- **ContainerNamespace** : namespace Scaleway Serverless Containers (`coop-mediation-numerique-web`)
- Configure avec les variables d'environnement partagees :
  - Sentry (DSN, org, project, auth token)
  - Cockpit/Grafana (URLs metrics, logs, alertmanager)
  - S3, region, Node env, timezone
  - Secrets : Cockpit token, NextAuth secret, credentials Scaleway

#### Email transactionnel

- **TemDomain** : domaine Scaleway TEM (Transactional Email Module)
- Enregistrements DNS :
  - **SPF** : inclut `_spf.ox.numerique.gouv.fr` + config Scaleway TEM
  - **DKIM** : cle de signature pour les emails transactionnels
  - **MX** : `mx.ox.numerique.gouv.fr` pour la reception
  - **DMARC** : politique de validation (via Brevo)
  - **Brevo** : DKIM et verification de domaine pour les campagnes email

#### DNS

- **Zones DNS** : domaine principal (`coop-numerique.anct.gouv.fr`) et domaine de preview (`coop-mediation-numerique.incubateur.anct.gouv.fr`)
- **NS records** : `ns0.dom.scw.cloud` et `ns1.dom.scw.cloud`
- **CNAME** : sous-domaines pour IMAP, SMTP, webmail (Open-Xchange), Mattermost (`discussion`)

#### Monitoring (Cockpit/Grafana)

- **Cockpit** : plateforme d'observabilite Scaleway
- **CockpitToken** : token pour l'app web (lecture/ecriture logs et metriques)
- **Grafana users** : editeurs et viewers configures avec des comptes individuels

#### Instance MailDev (preview)

- **InstanceServer** : machine Scaleway `STARDUST1-S` avec Docker
- Execute un conteneur MailDev pour les environnements de preview
- Expose le port 80 (web) et 1025 (SMTP)
- IP publique avec DNS `maildev.coop-numerique.anct.gouv.fr`
- Security group : ports 80, 443, 1025, 22 ouverts en entree

#### Secrets

- **Secret Manager** : stockage securise de l'ID de l'instance de base de donnees

### WebAppStack — Ressources par environnement

La `WebAppStack` (`WebAppStack.ts`) est deployee pour chaque branche/namespace. Le namespace est derive du nom de la branche Git :

```
main        → namespace "main"    → domaine : coop-numerique.anct.gouv.fr
dev         → namespace "dev"     → domaine : dev.coop-mediation-numerique.incubateur.anct.gouv.fr
feat/ma-feature → namespace correspondant → sous-domaine de preview
```

#### Base de donnees par environnement

Chaque namespace a sa propre base de donnees et son propre utilisateur sur l'instance partagee :

- **RdbUser** : utilisateur `coop-mediation-numerique-<namespace>`
- **RdbDatabase** : base `coop-mediation-numerique-<namespace>`
- **RdbPrivilege** : permissions `all` sur la base

#### Bucket d'uploads

Chaque environnement a son propre bucket d'uploads :
- Nom : `coop-mediation-numerique-uploads-<namespace>`
- CORS configure pour le hostname de l'environnement

#### Conteneur Serverless

Chaque environnement deploie un conteneur Scaleway Serverless :

| Parametre | Production (`main`) | Dev (`dev`) | Preview (autres branches) |
|---|---|---|---|
| **Min scale** | 2 | 1 | 0 |
| **Max scale** | 5 | 1 | 1 |
| **CPU** | 3000 mVPCU | 1120 mVPCU | 1120 mVPCU |
| **Memoire** | 3072 Mo | 2048 Mo | 2048 Mo |

Le conteneur recoit une quarantaine de variables d'environnement couvrant :
- URL de la base de donnees (construite dynamiquement)
- Credentials ProConnect (main vs preview)
- Credentials SMTP (Scaleway TEM en prod, MailDev en preview)
- Cles API externes (Brevo, API Entreprise, RDV Service Public, Albert, Brave)
- Configuration interne (namespace, branche, URL de base)

#### DNS et domaine

- **Production** : enregistrement `ALIAS` vers le conteneur (domaine racine)
- **Preview** : enregistrement `CNAME` vers le conteneur (sous-domaine)
- **ContainerDomain** : liaison entre le conteneur et le hostname

#### Jobs planifies (Cron)

Les crons sont configures via `ContainerCron` Scaleway et envoient des requetes au conteneur :

**Production uniquement :**

| Job | Frequence | Description |
|---|---|---|
| `backup-database` (hourly) | Toutes les heures | Sauvegarde horaire de la base |
| `backup-database` (daily) | Tous les jours a minuit | Sauvegarde quotidienne |
| `backup-database` (weekly) | Tous les dimanches a minuit | Sauvegarde hebdomadaire |
| `sync-users-from-dataspace` | Tous les jours a 2h | Synchronisation utilisateurs Dataspace |
| `fix-users-roles` | Tous les jours a minuit | Correction des roles utilisateurs |
| `inactive-users-reminders` | Tous les jours a minuit | Relances inscriptions incompletes |
| `remove-orphan-brevo-contacts` | Tous les jours a 3h | Nettoyage contacts Brevo orphelins |
| `normalize-structures-employeuses` | Tous les jours a 4h | Normalisation des structures |

**Dev et production :**

| Job | Frequence | Description |
|---|---|---|
| `sync-rdvsp-data` | Tous les jours a 2h | Synchronisation RDV Service Public |

**Tous les environnements :**

| Job | Frequence | Description |
|---|---|---|
| `update-structures-cartographie-nationale` | Tous les jours a 3h | Mise a jour des structures depuis la cartographie nationale |

### Deployer l'infrastructure

```bash
# Synthetiser le code Terraform
pnpm -F cdk synth

# Voir les outputs
pnpm -F cdk output

# Utiliser directement le CLI CDKTF
pnpm -F cdk cdktf diff    # Voir les changements
pnpm -F cdk cdktf deploy  # Appliquer les changements
```

Les variables Terraform necessaires sont definies dans `.env.dist` sous la section "CDK Variables".

### Schema de l'infrastructure

```
                    ┌─────────────────────────────────────┐
                    │          Scaleway Cloud (fr-par)     │
                    │                                     │
                    │  ┌───────────────────────────────┐  │
                    │  │       ProjectStack             │  │
                    │  │                               │  │
                    │  │  ┌─────────────────────────┐  │  │
                    │  │  │  PostgreSQL 14 (HA)     │  │  │
                    │  │  │  db-pro2-s / 60Go SBS   │  │  │
                    │  │  └─────────────────────────┘  │  │
                    │  │                               │  │
                    │  │  ┌──────────┐ ┌───────────┐  │  │
                    │  │  │ S3 Uploads│ │ S3 Backups│  │  │
                    │  │  └──────────┘ └───────────┘  │  │
                    │  │                               │  │
                    │  │  ┌──────────┐ ┌───────────┐  │  │
                    │  │  │ Registry │ │ Cockpit/  │  │  │
                    │  │  │ Docker   │ │ Grafana   │  │  │
                    │  │  └──────────┘ └───────────┘  │  │
                    │  │                               │  │
                    │  │  ┌──────────┐ ┌───────────┐  │  │
                    │  │  │ TEM Email│ │ DNS Zones │  │  │
                    │  │  └──────────┘ └───────────┘  │  │
                    │  │                               │  │
                    │  │  ┌──────────────────────────┐ │  │
                    │  │  │ MailDev Instance         │ │  │
                    │  │  │ (STARDUST1-S + Docker)   │ │  │
                    │  │  └──────────────────────────┘ │  │
                    │  └───────────────────────────────┘  │
                    │                                     │
                    │  ┌───────────────────────────────┐  │
                    │  │  WebAppStack (par branche)     │  │
                    │  │                               │  │
                    │  │  ┌─────────┐ ┌─────────────┐  │  │
                    │  │  │Container│ │ RDB Database │  │  │
                    │  │  │Serverless│ │ + User      │  │  │
                    │  │  └─────────┘ └─────────────┘  │  │
                    │  │                               │  │
                    │  │  ┌─────────┐ ┌─────────────┐  │  │
                    │  │  │S3 Upload│ │ DNS Record  │  │  │
                    │  │  │Bucket   │ │ + Domain    │  │  │
                    │  │  └─────────┘ └─────────────┘  │  │
                    │  │                               │  │
                    │  │  ┌─────────────────────────┐  │  │
                    │  │  │  Cron Jobs (production) │  │  │
                    │  │  │  Backups, syncs, etc.   │  │  │
                    │  │  └─────────────────────────┘  │  │
                    │  └───────────────────────────────┘  │
                    └─────────────────────────────────────┘
```

### CI/CD

Le pipeline CI/CD est gere par **CircleCI** (`.circleci/config.yml`) :

- **Push sur une branche** : deploiement automatique d'un environnement de preview
- **Merge sur `main`** : deploiement automatique en production
- **Suppression de branche** : nettoyage de l'environnement de preview

---

## Procedures de contribution

### Branches

- Creer les branches a partir de la branche `dev` (a jour)
- Prefixer les branches selon la nature des modifications :
  `build/`, `chore/`, `ci/`, `docs/`, `feat/`, `fix/`, `perf/`, `refactor/`, `revert/`, `style/`, `test/`

Exemple : `feat/ajout-export-csv`, `fix/correction-pagination`

### Commits

- Les messages de commit doivent suivre la specification [Commits Conventionnels](https://www.conventionalcommits.org/fr)
- Les commits doivent etre signes (GPG)
- Consultez la [documentation GitHub](https://docs.github.com/en/authentication/managing-commit-signature-verification) pour configurer la signature

### Workflow de contribution

1. Creer une branche depuis `dev` :
   ```bash
   git checkout dev && git pull
   git checkout -b feat/nom-de-la-fonctionnalite
   ```
2. Developper et commiter :
   ```bash
   git commit -m "feat: ajoute une fonctionnalite"
   ```
3. Pousser et ouvrir une Pull Request vers `dev` :
   ```bash
   git push origin feat/nom-de-la-fonctionnalite
   ```
4. Apres review et merge dans `dev`, le merge dans `main` declenche le deploiement en production.

### Migrations de base de donnees

1. Modifier le schema dans `apps/web/prisma/schema.prisma`
2. Generer la migration :
   ```bash
   pnpm prisma:generate-migration nom_de_la_migration
   ```
3. Verifier le fichier SQL genere dans `apps/web/prisma/migrations/`

---

## Stack technique

### Langages et frameworks

- [TypeScript](https://www.typescriptlang.org/) — Langage principal
- [React 19](https://react.dev/) — Bibliotheque UI
- [Next.js 15](https://nextjs.org/) — Framework full-stack (App Router)
- [tRPC](https://trpc.io/) — API typees end-to-end
- [Prisma](https://www.prisma.io/) — ORM pour PostgreSQL
- [Zod](https://zod.dev/) — Validation de schemas
- [React Hook Form](https://react-hook-form.com/) — Gestion des formulaires

### UI et design

- [Systeme de Design de l'Etat (DSFR)](https://www.systeme-de-design.gouv.fr/) — Design system officiel
- [React DSFR](https://github.com/codegouvfr/react-dsfr) — Adaptation React du DSFR
- [MapLibre GL](https://maplibre.org/) — Cartographie
- [Recharts](https://recharts.org/) — Graphiques
- [Remix Icon](https://remixicon.com/) — Icones

### Backend et donnees

- [PostgreSQL 14+](https://www.postgresql.org/) avec [pgvector](https://github.com/pgvector/pgvector) — Base de donnees + embeddings
- [NextAuth.js](https://next-auth.js.org/) — Authentification
- [Nodemailer](https://nodemailer.com/) + [MJML](https://mjml.io/) — Envoi d'emails
- [Scaleway TEM](https://www.scaleway.com/en/transactional-email/) — Service email transactionnel

### IA

- [Vercel AI SDK](https://sdk.vercel.ai/) — Integration IA
- [OpenAI SDK](https://platform.openai.com/) — Modeles de langage
- Albert API — IA souveraine francaise

### Outils de developpement

- [pnpm](https://pnpm.io/) — Gestionnaire de paquets
- [Turborepo](https://turbo.build/) — Orchestration monorepo
- [Biome](https://biomejs.dev/) — Linting et formatage
- [Prettier](https://prettier.io/) — Formatage complementaire
- [Jest](https://jestjs.io/) — Tests unitaires et d'integration
- [Cypress](https://www.cypress.io/) — Tests end-to-end
- [Storybook](https://storybook.js.org/) — Documentation de composants
- [Sentry](https://sentry.io/) — Monitoring d'erreurs
- [Matomo](https://matomo.org/) — Analytics web

### Infrastructure

- [Scaleway](https://www.scaleway.com/) — Hebergement cloud
- [CDKTF](https://developer.hashicorp.com/terraform/cdktf) — Infrastructure as Code (Terraform en TypeScript)
- [CircleCI](https://circleci.com/) — CI/CD
- [Docker](https://www.docker.com/) — Conteneurisation

---

## Licence

Ce projet est sous licence [AGPL-3.0-or-later](LICENSE).
