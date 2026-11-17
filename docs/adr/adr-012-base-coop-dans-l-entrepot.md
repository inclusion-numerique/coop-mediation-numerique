# ADR-012 : La base de la Coop dans le schéma `coop` de l'Entrepôt

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                             |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-08 | Marc Gavanier | Tables et enums de la Coop déplacés dans un schéma `coop` (`ef06426ab`, migration `20260603120000_move_to_coop_schema`, #519 puis #520 sur `main`) |
| 2026-06-09 | Marc Gavanier | Les conteneurs déployés ouvrent un tunnel SSH vers la base de l'Entrepôt (`084c70117`)                                                             |
| 2026-06-12 | Marc Gavanier | `_prisma_migrations` isolée dans le schéma `coop` (`566f20b31`)                                                                                    |
| 2026-06-17 | Marc Gavanier | Essai sur une branche dédiée (`2ac815335`), puis production basculée sur la base de l'Entrepôt (`982a9be38`, #538 puis #539 sur `main`)            |
| 2026-06-23 | Marc Gavanier | Les migrations de la production passent par le tunnel, avant le déploiement du conteneur (`b091b210f`, #546 puis #547 sur `main`)                  |
| 2026-07-08 | Marc Gavanier | La restauration de sauvegarde refuse de viser la production (`33ab75fbf`)                                                                          |
| 2026-10-07 | Marc Gavanier | Infrastructure en OpenTofu : `database_url` vaut `ENTREPOT_DATABASE_URL` pour `main` seulement (`968e6efe2`, #669)                                 |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                          |

## Statut

Accepté — en production depuis juin 2026.

## Contexte

La Coop avait sa propre base. L'Entrepôt de données de l'inclusion numérique (Dataspace) en avait
une autre. Il fait référence sur la médiation numérique, et son schéma `main` porte les registres
partagés : personnes, structures, lieux.

Entre les deux bases, une couche de synchronisation recopiait les données. Elle apportait des
délais, des écarts, et une question d'autorité sans réponse simple. La Coop gardait par exemple une
table miroir de la cartographie nationale.

Les deux bases ne sont pas dans le même projet d'hébergement. La base de l'Entrepôt n'expose qu'un
point d'accès privé.

## Décision

### Un schéma `coop`

Toutes les tables et tous les enums de la Coop vivent dans le schéma `coop`. Les extensions
restent dans `public`. Chaque connexion porte `search_path=coop,public` : les requêtes SQL brutes
qui nomment les tables sans schéma continuent de les trouver. La table `_prisma_migrations` est
elle aussi dans `coop`.

Le déplacement est une seule migration, atomique. Il ne réécrit pas les données : `SET SCHEMA` ne
touche que le catalogue.

### La production dans la base de l'Entrepôt

En production, le schéma `coop` vit dans la base de l'Entrepôt, à côté de `main` et des autres
schémas de l'Entrepôt. Le schéma a été copié une fois, structure et données, puis l'application
a pointé dessus. L'ancienne base de production de la Coop n'est plus utilisée.

La base de l'Entrepôt n'est joignable que par un bastion SSH :

- au runtime, `docker/web/entrypoint.sh` ouvre un tunnel `autossh` sur `localhost:5433` ;
- au déploiement, `.github/workflows/deploy.reusable.yml` ouvre son propre tunnel et applique les
  migrations avant de déployer le conteneur ([ADR-014](./adr-014-migrations-destructives-en-deux-temps.md)) ;
- `infrastructure/locals.tf` choisit `ENTREPOT_DATABASE_URL` pour `main`.

Un second client Prisma (`apps/web/src/entrepotPrismaClient.ts`) lit les schémas de l'Entrepôt.
Il n'est jamais passé à `prisma migrate` : l'Entrepôt possède ces schémas.

### `dev` et les previews restent sur l'instance de l'incubateur

`dev` et chaque preview ont leur base sur l'instance RDB partagée de l'incubateur, créée par
`infrastructure/database.tf`. Leurs migrations et leurs fixtures passent normalement. Seule la
production est dans l'Entrepôt.

### Ce que cela permet

Les échanges avec `main` deviennent des écritures dans la même base. La double écriture du
registre des lieux en une seule transaction ([ADR-003](./adr-003-registre-des-lieux-entrepot.md))
et la migration des structures employeuses vers `main`
([ADR-002](./adr-002-migration-structures-employeuses-vers-main.md)) reposent sur cette décision.

## Alternatives écartées

### Migrer table par table, derrière une passerelle applicative

C'était le premier plan : chaque table quitte la base de la Coop pour vivre entière dans
l'Entrepôt, et les références restantes passent par une passerelle. Il faisait perdre les
jointures SQL et l'atomicité des transactions à chaque frontière, pendant toute la durée de la
migration. Il a été abandonné le 17/06/2026 au profit d'une copie unique suivie d'une bascule.

### Relier les deux bases par `postgres_fdw`

Les deux bases sont sur des instances distinctes, dans des projets distincts. Une jointure à
travers le réseau n'aurait été ni fiable ni rapide.

### Garder deux bases et la synchronisation

C'est la situation qu'on voulait quitter : délais, écarts, autorité ambiguë.

### Exposer la base de l'Entrepôt sur un point d'accès public, ou relier les réseaux privés

Un point d'accès public expose la base. Relier les réseaux privés de deux projets distincts était
lourd et pas éprouvé pour une base managée. Le tunnel SSH par bastion était déjà le mode d'accès
d'autres consommateurs de l'Entrepôt.

## Conséquences

- Positif : plus de synchronisation entre deux bases ; la Coop écrit et lit `main` dans ses
  propres transactions.
- Positif : `coop` et les schémas de l'Entrepôt restent séparés, et chaque équipe garde son schéma.
- Négatif : le tunnel est un point de défaillance. Quand il tombe, toutes les routes rendent une
  erreur 500 jusqu'à ce qu'`autossh` reconnecte. Une erreur `localhost:5433` en production désigne
  ce tunnel, pas une mauvaise configuration.
- Négatif : la base est partagée. Une erreur d'exploitation sur la production touche aussi
  l'Entrepôt : le 08/07/2026, une restauration lancée sur la mauvaise base a supprimé des schémas de
  l'Entrepôt avec `coop`. La restauration refuse désormais de viser la production.
- Négatif : la base de `dev` n'est pas celle de la production. Elle n'a pas les schémas propres à
  l'Entrepôt (`admin`, les vues `llm`). Une migration qui passe sur `dev` peut échouer en
  production.
- Négatif : l'Entrepôt définit des vues sur des tables de `coop`. Elles bloquent la suppression des
  colonnes et des tables qu'elles lisent ([ADR-014](./adr-014-migrations-destructives-en-deux-temps.md)).
- Négatif : le rôle de migration dépend des droits DDL que l'Entrepôt lui accorde. Le 29/06/2026,
  une migration a échoué en production faute de ces droits (voir le runbook).
- Négatif : la charge de la Coop et celle de l'Entrepôt partagent les mêmes ressources, et deux
  clients Prisma ouvrent des connexions vers la même base.

## Références

- `apps/web/prisma/migrations/20260603120000_move_to_coop_schema/`
- `docker/web/entrypoint.sh`, `infrastructure/locals.tf`, `infrastructure/database.tf`
- `.github/workflows/deploy.reusable.yml`
- `infrastructure/README.md`
- `docs/runbook-migrations-entrepot.md`

## ADR liés

- [ADR-002 : Les structures employeuses vivent dans main (Dataspace)](./adr-002-migration-structures-employeuses-vers-main.md)
- [ADR-003 : Registre des lieux de l'Entrepôt](./adr-003-registre-des-lieux-entrepot.md)
- [ADR-013 : Compteurs dénormalisés tenus par des triggers](./adr-013-compteurs-tenus-par-la-base.md)
- [ADR-014 : Migrations destructives en deux temps](./adr-014-migrations-destructives-en-deux-temps.md)
