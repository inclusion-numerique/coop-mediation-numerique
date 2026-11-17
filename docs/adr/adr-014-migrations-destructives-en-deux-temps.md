# ADR-014 : Migrations destructives en deux temps

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                         |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-23 | Marc Gavanier | Les migrations de la production passent avant le déploiement du conteneur (`b091b210f`, #546 puis #547 sur `main`)                             |
| 2026-10-27 | Marc Gavanier | #705 fusionnée avec sa migration de `DROP` (`8fd2dcc12`) ; migration retirée par #708 (`e74c7a195`), puis livrée seule dans #709 (`183e297b5`) |
| 2026-11-16 | Marc Gavanier | Colonnes vides de `users` : le code cesse de les lire et de les écrire (`f9f94f033`, #729), puis leur `DROP` (`317fb7ab0`, #730)               |
| 2026-11-17 | Marc Gavanier | `DROP` de `activites.v1_cra_id_pg`, une fois retirée de la vue de l'Entrepôt qui la lisait (`76c1da7ee`, #733)                                 |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                      |

## Statut

Accepté — appliqué à chaque suppression de table ou de colonne.

## Contexte

En production, `.github/workflows/deploy.reusable.yml` enchaîne :

1. « Migrate coop schema on the Entrepôt (SSH tunnel) » : `prisma migrate deploy` sur la base de
   la production ;
2. « Apply infrastructure » : OpenTofu déploie le nouveau conteneur.

Entre les deux, et jusqu'à ce que le nouveau conteneur prenne le trafic, l'ancien code tourne sur
la base déjà migrée. Cet ordre est voulu : si la migration échoue, le déploiement s'arrête et
l'ancien conteneur continue de servir.

Mais un `DROP` livré avec le code qui cesse de lire la colonne casse l'ancien conteneur. Une
colonne lue par la session, ou par un `findUnique` sans `select`, fait échouer toutes les requêtes
authentifiées jusqu'à la bascule.

Le cas s'est présenté le 27/10/2026. #705 a été fusionnée avec la migration qui supprimait
`users.image_id` et les tables d'employeuses. #708 a retiré cette migration avant la mise en
production.

## Décision

Une suppression de table ou de colonne se fait en deux pull requests, déployées l'une après
l'autre.

### Première PR : le code cesse de lire et d'écrire

La table ou la colonne quitte `schema.prisma` et le code. Prisma ignore ce que son schéma ne
déclare plus : le nouveau code tourne sur la base telle qu'elle est. Cette PR ne contient aucune
migration destructive.

### Seconde PR : le `DROP`, une fois la première en production

La migration destructive part seule, quand plus aucun conteneur en service ne lit l'objet.

Avant de la fusionner :

- vérifier en production qu'aucune vue ni fonction ne dépend de l'objet (`pg_depend`). L'Entrepôt
  définit des vues sur des tables de `coop`, et la base de `dev` ne les a pas
  ([ADR-012](./adr-012-base-coop-dans-l-entrepot.md)). Un `DROP` bloqué par une vue échoue au
  milieu du déploiement ;
- faire une sauvegarde ciblée des données supprimées quand elles ne sont pas vides ;
- poser un `lock_timeout` quand la table est volumineuse.

Si une vue de l'Entrepôt dépend de l'objet, le `DROP` attend que l'équipe de l'Entrepôt l'ait
revue.

### Exemples

- `users.title`, `users.location`, `users.description` : #729 retire la lecture par la session et
  l'écriture par l'anonymisation ; #730 les supprime, une fois #729 en production.
- `activites.v1_cra_id_pg` : retirée du schéma Prisma par #729. Son `DROP` a attendu, parce que la
  vue `llm.coop_activites` de l'Entrepôt la sélectionnait. L'Entrepôt l'en a retirée le
  17/11/2026 ; #733 l'a supprimée le jour même.
- Tables d'employeuses : retirées du code par #705, elles restent en base tant que deux vues de
  l'Entrepôt les lisent. #709 n'a supprimé que les objets sans vue dépendante.

## Alternatives écartées

### Migrer après la bascule du conteneur

Le nouveau code tournerait alors sur l'ancienne base. C'est l'ajout de colonne qui casserait. Et
une migration en échec laisserait en service un code qui attend un schéma absent, sans retour
arrière simple. L'ordre actuel garde le retour arrière sûr.

### Accepter une coupure pendant le déploiement

Toutes les requêtes authentifiées échoueraient pendant plusieurs minutes, sans fenêtre de
maintenance annoncée.

### Laisser les colonnes et tables mortes en base

Elles s'accumulent, trompent la lecture du schéma et gardent des données qui n'ont plus de raison
d'être.

## Conséquences

- Positif : une suppression ne casse jamais le conteneur en service.
- Positif : la seconde PR est petite et se relit seule ; la vérification des dépendances en
  production se fait au bon moment.
- Négatif : deux PR et deux mises en production pour une suppression.
- Négatif : entre les deux, la base porte des objets que le code ne déclare plus. Le schéma Prisma
  ne décrit plus toute la base.
- Négatif : une suppression peut dépendre d'une autre équipe et attendre sans échéance, comme les
  tables d'employeuses.
- À noter : pour `dev` et les previews, le même workflow migre _après_ « Apply infrastructure ».
  Le risque y est inversé : le nouveau code tourne un moment sur une base pas encore migrée.

## Références

- `.github/workflows/deploy.reusable.yml`
- `docs/runbook-migrations-entrepot.md`
- [ADR-012](./adr-012-base-coop-dans-l-entrepot.md)

## ADR liés

- [ADR-012 : La base de la Coop dans le schéma `coop` de l'Entrepôt](./adr-012-base-coop-dans-l-entrepot.md)
- [ADR-015 : CI sur GitHub Actions, infrastructure en HCL avec OpenTofu](./adr-015-ci-github-actions-et-opentofu.md)
