# Runbook — Migrations du schéma `coop` sur l'Entrepôt

> Procédure d'exploitation pour intervenir manuellement sur les migrations Prisma de la base de
> production, hébergée dans l'Entrepôt (Dataspace). À utiliser notamment pour débloquer une
> migration échouée (erreur Prisma **P3009**).

## Contexte

En production (`main`), le schéma `coop` ne vit plus dans une base dédiée mais dans la base
`dataspace_prod` de l'**Entrepôt**, joignable uniquement via le **tunnel SSH du bastion**
(`172.16.20.14:5432`, réseau privé).

La CI ouvre ce tunnel puis lance `prisma migrate deploy` **avant** de déployer le conteneur : si la
migration échoue, le déploiement est avorté et l'ancien conteneur continue de servir
(cf. `.circleci/config.yml`, étape « Migrate coop schema on the Entrepôt »).

`ENTREPOT_DATABASE_URL` porte déjà `search_path=coop`, donc les migrations s'appliquent bien sur
`coop._prisma_migrations`.

## 1. Ouvrir le tunnel SSH en local

```bash
ssh -i ~/entrepot_bastion_key -N -L 5455:172.16.20.14:5432 bastion@51.15.201.189 -p 61000
```

- Port **local 5455** → `172.16.20.14:5432` (la base de l'Entrepôt) via le bastion.
- Laisser ce terminal ouvert (le tunnel reste actif tant que la commande tourne).
- Le warning `bind [::1]:5433: Cannot assign requested address` vu en CI est inoffensif : c'est
  l'échec du bind IPv6 ; le forward IPv4 fonctionne.

## 2. Définir l'URL de connexion locale

Pointer `DATABASE_URL` sur le tunnel (port 5455), schéma `coop` :

```bash
export DATABASE_URL="postgresql://<user>:<password>@127.0.0.1:5455/dataspace_prod?schema=coop"
```

> ⚠️ Le rôle utilisé doit avoir les droits **DDL** (ALTER/DROP) sur le schéma `coop`, sinon les
> migrations rejoueront le même échec de permissions.

## 3. Diagnostiquer une migration échouée (P3009)

L'erreur :

```
Error: P3009
migrate found failed migrations in the target database, new migrations will not be applied.
The `<timestamp>_<name>` migration started at <date> failed
```

signifie qu'une migration a laissé une ligne « échouée » dans `coop._prisma_migrations`
(`finished_at` NULL, `rolled_back_at` NULL). **Tant que cette ligne n'est pas résolue, Prisma
refuse d'appliquer toute nouvelle migration.**

Inspecter l'état réel :

```bash
# Statut Prisma
pnpm -F @app/web prisma migrate status

# Ligne en échec dans la table de suivi
psql "$DATABASE_URL" -c \
  "SELECT migration_name, started_at, finished_at, rolled_back_at, logs
   FROM coop._prisma_migrations
   WHERE finished_at IS NULL;"
```

Puis **vérifier ce que la migration a réellement appliqué** avant de planter (crucial pour une
migration multi-statements). Exemple pour `drop_structures_cartographie_nationale` :

```bash
psql "$DATABASE_URL" -c "\d coop.structures_cartographie_nationale"   -- la table existe-t-elle encore ?
psql "$DATABASE_URL" -c \
  "SELECT conname FROM pg_constraint
   WHERE conname = 'structures_id_cartographie_nationale_fkey';"      -- la contrainte existe-t-elle encore ?
```

## 4. Résoudre puis relancer

Deux résolutions opposées selon l'état observé à l'étape 3 :

| État réel de la base                                                                        | Commande                                           | Effet                                                   |
|---------------------------------------------------------------------------------------------|----------------------------------------------------|---------------------------------------------------------|
| Les changements **n'ont pas** été appliqués (ex. échec de permissions sur le 1ᵉʳ statement) | `prisma migrate resolve --rolled-back <migration>` | Prisma re-tentera la migration au prochain `deploy`     |
| Les changements **ont** été appliqués malgré l'erreur reportée                              | `prisma migrate resolve --applied <migration>`     | Prisma considère la migration faite et passe à la suite |

```bash
# Cas le plus courant ici (échec de droits → rien d'appliqué) :
pnpm -F @app/web prisma migrate resolve \
  --rolled-back 20260618120000_drop_structures_cartographie_nationale

# Vérifier que P3009 a disparu, puis relancer les migrations :
pnpm -F @app/web prisma migrate status
DATABASE_URL="$DATABASE_URL" pnpm -F @app/web prisma migrate deploy
```

> ⚠️ **Cas partiellement appliqué** : si une migration multi-statements a appliqué une partie de
> son DDL avant d'échouer, un `--rolled-back` suivi d'un re-run butera sur l'objet déjà modifié
> (ex. `DROP TABLE` d'une table déjà supprimée). Dans ce cas, soit terminer manuellement les
> statements restants en SQL puis `--applied`, soit rendre le `migration.sql` idempotent
> (`IF EXISTS`) avant de rejouer.

Une fois la base à jour, un nouveau push sur `main` (ou un re-run du job CI) repassera l'étape de
migration sans erreur.

## Historique des incidents

- **2026-06-29** — `20260618120000_drop_structures_cartographie_nationale` échouée en prod (P3009).
  Cause : droits DDL insuffisants du rôle de migration sur `coop`. Après obtention des droits :
  résolution par `--rolled-back` puis re-run.