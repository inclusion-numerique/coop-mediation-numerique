# ADR-012 : La base de la coop dans le schéma `coop` de l'Entrepôt

## Auteurs et historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |

## Statut

Accepté

## Contexte

La coop avait sa propre base, et Dataspace, l'Entrepôt de données de l'inclusion numérique, en
avait une autre. L'Entrepôt fait référence sur la médiation numérique : son schéma `main` porte les
registres partagés, personnes, structures et lieux.

Entre les deux bases, une couche de synchronisation recopiait les données. Elle apportait des
délais, des écarts, et une autorité ambiguë sur les données recopiées.

Les deux bases sont dans des projets d'hébergement différents, et celle de l'Entrepôt n'expose
qu'un point d'accès privé.

## Décision

Les données de la coop vivent dans un schéma `coop` qui lui est propre. En production, ce schéma
est dans la base de l'Entrepôt, à côté de `main`, et la synchronisation entre deux bases disparaît.

### Un schéma `coop`

Toutes les tables et tous les enums de la coop vivent dans le schéma `coop`. Les extensions restent
dans `public`. Chaque connexion cherche d'abord dans `coop`, puis dans `public` : les requêtes qui
nomment une table sans son schéma la trouvent toujours. La table de suivi des migrations est elle
aussi dans `coop`.

Le déplacement est une seule migration, atomique. Il ne réécrit pas les données : seul le catalogue
de la base change.

### La production dans la base de l'Entrepôt

En production, le schéma `coop` vit dans la base de l'Entrepôt, à côté de `main` et des autres
schémas de l'Entrepôt. Il a été copié une fois, structure et données, puis l'application a basculé
dessus. L'ancienne base de production de la coop n'est plus utilisée.

La base de l'Entrepôt n'est joignable que par un bastion SSH :

- au runtime, le conteneur de l'application ouvre un tunnel vers la base ;
- au déploiement, la CI ouvre son propre tunnel et applique les migrations avant de déployer le
  conteneur.

La configuration d'infrastructure choisit l'adresse de la base de l'Entrepôt pour la production.

Un second client Prisma lit les schémas de l'Entrepôt. Il n'est jamais passé à la migration :
l'Entrepôt possède ces schémas. Sa place dans la cible est décidée par
l'[ADR-002](./adr-002-migration-structures-employeuses-vers-main.md).

### Développement et previews sur l'instance de l'incubateur

Le développement et chaque preview ont leur base sur l'instance partagée de l'incubateur, créée par
l'infrastructure. Leurs migrations et leurs fixtures passent normalement. Seule la production est
dans l'Entrepôt.

Dans tous les environnements, les migrations de la coop ne touchent jamais la structure de `main` :
Dataspace fait autorité sur `main` et la coop s'y conforme
([ADR-002](./adr-002-migration-structures-employeuses-vers-main.md)).

### Ce que cela permet

Les échanges avec `main` deviennent des écritures dans la même base. La migration des structures
employeuses vers `main` ([ADR-002](./adr-002-migration-structures-employeuses-vers-main.md)) et la
double écriture du registre des lieux en une seule transaction
([ADR-003](./adr-003-registre-des-lieux-entrepot.md)) reposent sur cette décision.

## Alternatives écartées

### Migrer table par table, derrière une passerelle applicative

Chaque table aurait quitté la base de la coop pour vivre entière dans l'Entrepôt, et les références
restantes seraient passées par une passerelle applicative. Ce plan faisait perdre les jointures et
l'atomicité des transactions à chaque frontière, pendant toute la durée de la migration. Il a été
abandonné au profit d'une copie unique suivie d'une bascule.

### Relier les deux bases par `postgres_fdw`

Les deux bases sont sur des instances distinctes, dans des projets distincts. Une jointure à
travers le réseau n'aurait été ni fiable ni rapide.

### Garder deux bases et la synchronisation

C'est la situation qu'on voulait quitter : délais, écarts, autorité ambiguë.

### Exposer la base publiquement, ou relier les réseaux privés

Un point d'accès public expose la base de l'Entrepôt : le risque était jugé trop grand. Relier les
réseaux privés de deux projets distincts était lourd et pas éprouvé pour une base managée. Le
bastion SSH servait déjà à d'autres consommateurs de l'Entrepôt.

## Conséquences

**Positives**

- Plus de synchronisation entre deux bases : la coop lit et écrit les données de `main` dans ses
  propres transactions, la structure de `main` restant décidée par Dataspace.
- `coop` et les schémas de l'Entrepôt restent séparés, et chaque équipe garde le sien.

**Négatives ou à surveiller**

- **Le tunnel est un point de défaillance** : quand il tombe, toutes les routes rendent une erreur
  jusqu'à ce qu'il se reconnecte.
- **La base est partagée** : une erreur d'exploitation sur la production touche aussi l'Entrepôt.
  Une restauration lancée sur la mauvaise base a déjà supprimé des schémas de l'Entrepôt ; la
  restauration refuse donc désormais de viser la production.
- **La base de développement n'est pas celle de la production** : elle n'a pas les schémas propres
  à l'Entrepôt, et une migration qui passe en développement peut échouer en production.
- **Des vues de l'Entrepôt lisent des tables de la coop** : elles bloquent la suppression des
  colonnes et des tables qu'elles lisent.
- **Le rôle de migration dépend des droits que l'Entrepôt lui accorde** : une migration a déjà
  échoué en production faute de ces droits. La coop, elle, ne modifie jamais la structure de
  `main`.
- **Ressources partagées** : la charge de la coop et celle de l'Entrepôt partagent les mêmes
  ressources, et deux clients Prisma ouvrent des connexions vers la même base.

## Où trouver le détail

- Le [README d'infrastructure](../../infrastructure/README.md) décrit les bases de chaque
  environnement, l'instance partagée de l'incubateur et l'accès à l'Entrepôt.

## Références

- [ADR-002 : Les structures employeuses vivent dans main (Dataspace)](./adr-002-migration-structures-employeuses-vers-main.md)
- [ADR-003 : Registre des lieux de l'Entrepôt](./adr-003-registre-des-lieux-entrepot.md)
- [README d'infrastructure](../../infrastructure/README.md)
