# Infrastructure

L'infrastructure de chaque environnement (`main`, `dev` et les previews) est décrite en HCL et déployée avec [OpenTofu](https://opentofu.org) sur [Scaleway](https://www.scaleway.com), avec le [fournisseur Scaleway](https://search.opentofu.org/provider/scaleway/scaleway/latest).

## 📑 Table des matières

- 🧱 [Ressources partagées](#ressources-partagees)
- 📦 [Ressources d'un environnement](#ressources)
- ⏱️ [Tâches planifiées](#taches-planifiees)
- 🗂️ [État](#etat)
- 🚀 [Déploiement](#deploiement)
- 🔍 [Lire un plan en local](#plan-local)
- 🧰 [Outils du CLI](#cli)

<h2 id="ressources-partagees">🧱 Ressources partagées</h2>

Les ressources communes à tous les environnements sont gérées par l'infrastructure de l'incubateur, hors de ce dépôt : l'instance de base de données des environnements hors production, l'espace de noms des conteneurs, le registre d'images, les zones DNS et le MailDev qui reçoit les e-mails de `dev` et des previews (`maildev.coop-numerique.anct.gouv.fr`). Ce dépôt les lit sans les modifier. La production envoie ses e-mails par un serveur SMTP réel.

La base de la production n'est pas sur cette instance : c'est le schéma `coop` de l'Entrepôt de données de l'inclusion numérique (`ENTREPOT_DATABASE_URL`), joignable seulement par un bastion SSH.

<h2 id="ressources">📦 Ressources d'un environnement</h2>

| Fichier        | Ressources                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `database.tf`  | Utilisateur, base et privilèges sur l'instance partagée, sauf pour `main`, dont la base est l'Entrepôt |
| `container.tf` | Conteneur serverless de l'application et ses variables d'environnement                                 |
| `dns.tf`       | Enregistrement DNS et domaine du conteneur                                                             |
| `jobs.tf`      | Tâches planifiées et leurs secrets                                                                     |
| `locals.tf`    | Domaines, noms, URL de base de données et planning des tâches de chaque environnement                  |
| `variables.tf` | Variables d'entrée, lues par `src/cli/commands/infrastructure/infrastructure-variables.ts`             |
| `outputs.tf`   | Sorties lues par le CLI                                                                                |
| `versions.tf`  | Versions d'OpenTofu et du fournisseur, et stockage de l'état                                           |

Le conteneur est dimensionné selon l'environnement :

| Paramètre | Production (`main`) | `dev` et previews |
| --------- | ------------------- | ----------------- |
| Minimum   | 2 instances         | 0                 |
| Maximum   | 3 instances         | 1                 |
| CPU       | 1120 mVCPU          | 560 mVCPU         |
| Mémoire   | 2048 Mo             | 1024 Mo           |

Le namespace d'un environnement vaut `main`, `dev`, ou, pour une preview, le début du nom de sa branche suivi de six lettres dérivées du nom complet (`src/cli/branch-namespace.ts`). Ce suffixe rend très improbable que deux branches partagent des ressources. Le namespace fait au plus 14 caractères, la place laissée au sous-domaine de la preview sous `coop-mediation-numerique.incubateur.anct.gouv.fr`, pour que le suffixe y survive. Il nomme aussi l'image du conteneur et le secret du mot de passe de la base.

<h2 id="taches-planifiees">⏱️ Tâches planifiées</h2>

Une tâche planifiée est un [Serverless Job](https://www.scaleway.com/fr/serverless-jobs/) Scaleway (`scaleway_job_definition`). À l'heure dite, il démarre un conteneur à partir de l'image de l'application et exécute `node ./run-job.cjs <tâche>`. Ce script autonome est produit par `pnpm build:jobs` et ne passe ni par HTTP ni par le serveur Next. La CI vérifie qu'il se charge.

Une tâche dure au plus 3 heures et n'est pas relancée en cas d'échec. Elle reçoit les variables d'environnement du conteneur, et ses secrets par le Secret Manager (chemin `/jobs/<namespace>`). Une exécution en échec apparaît en échec dans la console Scaleway. Chaque exécution est aussi tracée dans la table `job_executions`.

Les horaires sont en UTC (`locals.tf`) :

| Tâche                             | Horaire | Environnements      |
| --------------------------------- | ------- | ------------------- |
| `inactive-users-reminders`        | 00:00   | Production          |
| `retirer-les-roles-vacants`       | 00:00   | Production          |
| `anonymiser-les-comptes-inactifs` | 01:00   | Production          |
| `synchroniser-les-roles-brevo`    | 02:00   | Production          |
| `sync-rdvsp-data`                 | 02:00   | Production et `dev` |
| `remove-orphan-brevo-contacts`    | 03:00   | Production          |

Le rôle de chaque tâche est décrit dans le [guide de contribution](../CONTRIBUTING.md#taches).

<h2 id="etat">🗂️ État</h2>

L'état de chaque environnement est stocké dans le bucket `coop-mediation-numerique-terraform-state`, sous la clé `coop-mediation-numerique-web-<namespace>.tfstate`, passée à `tofu init` avec `-backend-config`.

<h2 id="deploiement">🚀 Déploiement</h2>

Le déploiement passe par les workflows GitHub Actions de `.github/workflows/` :

- **Release**, à chaque fusion dans `main` :
  1. Construit les images de `dev` et de la production, et planifie en parallèle l'infrastructure de chaque environnement contre l'image déployée.
  2. Si un plan change autre chose que les marques de sensibilité de l'état, attend l'approbation du job `Approve dev infrastructure` ou `Approve production infrastructure` (environnement GitHub `infrastructure-approval`). Le plan se lit dans le résumé du run.
  3. Déploie `dev`, puis la production si `dev` a réussi. En production, la migration du schéma `coop` sur l'Entrepôt passe, par le bastion, avant le déploiement du conteneur.
  4. Élague le registre d'images (`infrastructure:prune-registry`).
- **Preview** : le label `preview` sur une PR déploie l'environnement de sa branche ; le retirer, fermer ou fusionner la PR le détruit.
- **Remove ephemeral environment** : détruit l'infrastructure d'une preview (`tofu destroy`), supprime son image du registre, son secret de base de données, ses déploiements et son environnement GitHub, et nettoie ses erreurs dans Sentry.
- **CI** : quand une branche modifie `infrastructure/`, les jobs `Infrastructure plan dev` et `Infrastructure plan main` publient le plan de chaque environnement dans le résumé du run.

Les workflows réutilisables `infrastructure-plan.reusable.yml`, `build.reusable.yml` et `deploy.reusable.yml` planifient, construisent et appliquent ; un seul déploiement à la fois par environnement. Ils utilisent les secrets de dépôt `SCW_ACCESS_KEY` et `SCW_SECRET_KEY`, qui lisent les autres secrets dans le Secret Manager de Scaleway.

<h2 id="plan-local">🔍 Lire un plan en local</h2>

Avec les secrets dans le `.env` (`pnpm cli dotenv:from-secrets`) et OpenTofu installé :

```bash
DATABASE_PASSWORD=$(pnpm --silent cli secrets:database-password <namespace>) \
  WEB_CONTAINER_IMAGE=<image déployée> pnpm cli infrastructure:vars-from-env
pnpm with-env tofu -chdir=infrastructure init -backend-config="key=coop-mediation-numerique-web-<namespace>.tfstate"
pnpm with-env tofu -chdir=infrastructure plan -var-file=.tfvars.json -var "branch=<branche>" -var "namespace=<namespace>"
```

<h2 id="cli">🧰 Outils du CLI</h2>

| Commande                                                    | Rôle                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm cli infrastructure:vars-from-env`                     | Écrit `infrastructure/.tfvars.json` à partir des variables d'environnement                                                           |
| `pnpm cli infrastructure:prune-registry`                    | Supprime les images des branches disparues et les anciennes images de `main` et `dev` ; à blanc par défaut, `--apply` pour supprimer |
| `pnpm cli infrastructure:delete-registry-image <branche>`   | Supprime l'image d'une preview (jamais `main` ni `dev`)                                                                              |
| `pnpm cli dotenv:from-secrets`                              | Ajoute au `.env` les secrets du Secret Manager                                                                                       |
| `pnpm cli dotenv:from-infrastructure`                       | Ajoute au `.env` les sorties OpenTofu lues dans `infrastructure/outputs.json`                                                        |
| `pnpm cli secrets:database-password <namespace>`            | Lit le mot de passe de la base d'un environnement                                                                                    |
| `pnpm cli secrets:database:setup <namespace>`               | Crée le secret du mot de passe de la base d'une preview                                                                              |
| `pnpm cli secrets:database:delete <namespace>`              | Supprime ce secret (jamais `main` ni `dev`)                                                                                          |
| `pnpm cli sentry:delete-environment-issues <environnement>` | Supprime les erreurs Sentry d'un environnement et le masque (interdit pour `main`)                                                   |
| `pnpm cli deployment:check-status <url>`                    | Vérifie l'état de santé d'un déploiement                                                                                             |

Les autres commandes (`github:deployment:*`, `infrastructure:create`, `dotenv:add-next-public`) servent aux workflows. `pnpm cli --help` les liste toutes.
