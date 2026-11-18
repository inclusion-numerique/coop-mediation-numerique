# ADR-014 : Migrations destructives en deux temps

## Auteurs et historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |

## Statut

Accepté

## Contexte

En production, le déploiement enchaîne d'abord les migrations de la base, puis le déploiement du
nouveau conteneur.

Entre les deux, et jusqu'à ce que le nouveau conteneur prenne le trafic, l'ancien code tourne sur
la base déjà migrée. Cet ordre est voulu : si la migration échoue, le déploiement s'arrête et
l'ancien conteneur continue de servir.

Mais un `DROP` livré avec le code qui cesse de lire la colonne casse l'ancien conteneur. Une
colonne lue par la session fait échouer toutes les requêtes authentifiées jusqu'à la bascule.

Le cas s'est présenté : une migration qui supprimait une colonne et des tables d'employeuses a été
fusionnée, puis retirée avant la mise en production.

## Décision

Une suppression de table ou de colonne se fait en deux pull requests, déployées l'une après
l'autre. La première retire l'objet du code, la seconde le supprime de la base une fois la
première en production.

### Première PR : le code cesse de lire et d'écrire

La table ou la colonne quitte le schéma Prisma et le code. Prisma ignore ce que son schéma ne
déclare plus : le nouveau code tourne sur la base telle qu'elle est. Cette PR ne contient aucune
migration destructive.

### Seconde PR : le `DROP`, une fois la première en production

La migration destructive part seule, quand plus aucun conteneur en service ne lit l'objet.

Avant de la fusionner :

- vérifier en production qu'aucune vue ni fonction ne dépend de l'objet. L'Entrepôt définit des
  vues sur des tables de la coop, que la base de développement n'a pas
  ([ADR-012](./0012-base-coop-dans-l-entrepot.md)) ;
- faire une sauvegarde ciblée des données supprimées quand elles ne sont pas vides ;
- poser un délai de verrou quand la table est volumineuse.

Si une vue de l'Entrepôt dépend de l'objet, le `DROP` attend que l'équipe de l'Entrepôt l'ait
revue.

## Alternatives écartées

### Migrer après la bascule du conteneur

Le nouveau code tournerait alors sur l'ancienne base. Une migration en échec laisserait en service
un code qui attend un schéma absent, sans retour arrière simple. L'ordre actuel garde le retour
arrière sûr.

### Accepter une coupure pendant le déploiement

Toutes les requêtes authentifiées échoueraient pendant plusieurs minutes, sans fenêtre de
maintenance annoncée.

### Laisser les colonnes et tables mortes en base

Elles s'accumulent, trompent la lecture du schéma et gardent des données qui n'ont plus de raison
d'être.

## Conséquences

**Positives**

- Une suppression ne casse jamais le conteneur en service.
- La seconde PR est petite et se relit seule ; la vérification des dépendances en production se
  fait au bon moment.

**Négatives ou à surveiller**

- **Deux PR et deux mises en production** pour une suppression.
- **Entre les deux, la base porte des objets que le code ne déclare plus** : le schéma Prisma ne
  décrit plus toute la base.
- **Une suppression peut dépendre d'une autre équipe** et attendre sans échéance.

**À noter** : pour le développement et les previews, la migration passe après le déploiement de
l'infrastructure. Le risque y est inversé : le nouveau code tourne un moment sur une base pas
encore migrée.

## Où trouver le détail

Le [README d'infrastructure](../../infrastructure/README.md) décrit l'accès à la base de
production, par le bastion de l'Entrepôt.

## Références

- [ADR-012 : La base de la coop dans le schéma `coop` de l'Entrepôt](./0012-base-coop-dans-l-entrepot.md)
