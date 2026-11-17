# ADR-013 : Compteurs dénormalisés tenus par des triggers

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                             |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-27 | Marc Gavanier | Recalcul des compteurs des médiateurs, des bénéficiaires et des lieux, faussés par l'import des CRA v1 (`e1b183416`, #710)                         |
| 2026-11-17 | Marc Gavanier | Compteurs tenus par des triggers PostgreSQL, code applicatif d'incrément supprimé (`a0c86b428`, #732, anct-cnum/suite-gestionnaire-numerique#2181) |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                          |

## Statut

Accepté — en production ; le contrôle qui a suivi le déploiement n'a trouvé aucun écart.

## Contexte

Plusieurs tables portent des compteurs dénormalisés :

- `mediateurs` : `activites_count`, `accompagnements_count`, `beneficiaires_count` ;
- `beneficiaires` : `accompagnements_count` ;
- `activites` : `accompagnements_count` ;
- `lieu_inclusion` : `activites_count`.

L'application les incrémentait et les décrémentait elle-même, dans une dizaine de chemins
d'écriture. Ils dérivaient. L'import des CRA v1 ne les avait jamais incrémentés : #710 les a
recalculés le 27/10/2026. Trois semaines plus tard, sur une copie de la production, 1 067
médiateurs avaient de nouveau un nombre de bénéficiaires faux et 4 846 bénéficiaires un nombre
d'accompagnements faux. Les CRA créaient des bénéficiaires anonymes sans compter, la fusion de
bénéficiaires oubliait l'activité, la fusion de comptes laissait les compteurs de la source.

L'issue #2181 proposait de supprimer les compteurs et de compter à la lecture. Les mesures sur une
copie de la production ont montré que les statistiques devenaient 2 à 4 fois plus lentes :

- répartition des statistiques nationales : 2,4 s → 5,2 s ;
- totaux : 0,2 s → 0,85 s ; série par mois : 0,17 s → 0,65 s ;
- statistiques d'un coordinateur : +48 à +63 % ;
- tri de la liste d'administration par accompagnements : 2 ms → environ 1 s.

## Décision

Les compteurs restent, et PostgreSQL les tient lui-même. La migration
`apps/web/prisma/migrations/20261116230000_tenir_les_compteurs_par_la_base` installe le mécanisme.

### Des triggers par instruction, qui appliquent un delta

Des triggers `AFTER … FOR EACH STATEMENT` sont posés sur `accompagnements`, `activites`,
`beneficiaires`, `activite_tags` et `activite_coordination_tags`, en insertion, en modification et
en suppression, et sur `activite_coordination` en modification.

Chacun lit les tables de transition (`nouvelles`, `anciennes`). La fonction
`coop.compteurs_lignes` en fait une seule liste signée : `+1` pour une ligne ajoutée, `-1` pour une
ligne retirée, les deux pour une ligne modifiée. Le trigger regroupe par clé et applique la somme
en une seule mise à jour par clé touchée, quelle que soit la taille de l'instruction. Les clés dont
la somme vaut zéro ne sont pas touchées.

Une activité supprimée logiquement (`suppression` renseignée) ne compte plus. La passer de active à
supprimée, ou l'inverse, retire ou rend sa contribution.

### Un garde qui ignore les écritures applicatives

Un trigger `BEFORE INSERT OR UPDATE OF <compteur>` est posé sur chaque table qui porte un compteur.
Si l'écriture ne vient pas d'un trigger de compteur, il remet l'ancienne valeur, ou 0 à
l'insertion.

Les triggers de compteur se signalent par le réglage de session `coop.compteurs`, posé à `on` le
temps de leur travail avec `set_config(…, true)`, puis rendu à sa valeur précédente.

Le garde rend la bascule sûre. Pendant le déploiement, l'ancien conteneur peut continuer
d'incrémenter les compteurs : ses écritures sont ignorées sans erreur.

### Un compteur de plus : les tags

`tags.accompagnements_count` remplace le recomptage à chaque affichage. Il additionne les
accompagnements des activités non supprimées et les activités de coordination non supprimées qui
portent le tag.

### Un recalcul complet dans la migration

La migration recalcule tous les compteurs depuis les données, puis pose les triggers en service.
Sur une copie de la production, ce recalcul prend environ 45 s. La migration pose un
`lock_timeout` de 10 s.

### Ce qui disparaît

Tout le code applicatif d'incrément, et les utilitaires qui n'existaient que pour lui
(`refreshFixturesComputedFields`, `perteParMediateur`).

## Alternatives écartées

### Supprimer les compteurs et compter à la lecture

C'était la proposition de #2181. Elle rend les statistiques 2 à 4 fois plus lentes (voir le
contexte).

### Des triggers par ligne qui recomptent chaque clé

Simple à écrire, mais un CRA déclenche alors un recomptage complet des activités de son médiateur :
152 ms par CRA mesurées. Le delta par instruction coûte quelques millisecondes : un CRA individuel
du médiateur le plus actif passe de 9 à 16 ms.

### Des tables temporaires dans les triggers

Le droit `TEMPORARY` n'est pas garanti sur la base de l'Entrepôt
([ADR-012](./adr-012-base-coop-dans-l-entrepot.md)). Les triggers travaillent en SQL dynamique sur
les tables de transition.

### Garder l'incrément applicatif et recalculer périodiquement

Le recalcul de #710 a montré que les écarts reviennent en quelques semaines. Un recalcul périodique
laisse des compteurs faux entre deux passes.

## Conséquences

- Positif : les compteurs ne dépendent plus des chemins d'écriture. Un nouveau chemin les tient à
  jour sans y penser.
- Positif : les lectures gardent leur coût d'avant ; le surcoût en écriture est de quelques
  millisecondes.
- Positif : `apps/web/src/prisma/compteurs.integration.ts` vérifie le mécanisme sur une vraie base :
  saisie, suppression et restauration, fusion de bénéficiaires, transfert entre comptes,
  coordination, garde.
- Négatif : toute écriture applicative d'un compteur est ignorée sans erreur. Un test qui veut un
  compteur doit semer les vraies lignes qui le produisent.
- Négatif : une restauration _data-only_ avec les triggers actifs fausse les compteurs, puisque le
  garde remet à 0 les valeurs insérées. Une restauration complète crée les triggers après les
  données et n'est pas touchée.
- Négatif : la règle de comptage vit en PL/pgSQL, hors du domaine TypeScript. La changer demande
  une migration.
- Négatif : un traitement en masse sur les tables suivies paie aussi les triggers.

## Références

- `apps/web/prisma/migrations/20261116230000_tenir_les_compteurs_par_la_base/migration.sql`
- `apps/web/src/prisma/compteurs.integration.ts`
- anct-cnum/suite-gestionnaire-numerique#2181

## ADR liés

- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./adr-008-strategie-de-tests.md)
- [ADR-012 : La base de la Coop dans le schéma `coop` de l'Entrepôt](./adr-012-base-coop-dans-l-entrepot.md)
