---
status: "accepté"
date: 2026-11-17
decision-makers: Marc Gavanier
---

# Compteurs dénormalisés tenus par des triggers

## Contexte et problème

Plusieurs tables portent des compteurs dénormalisés : sur les médiateurs, les bénéficiaires, les
activités et les lieux.

L'application les incrémentait et les décrémentait elle-même, dans une dizaine de chemins
d'écriture. Ils dérivaient.

L'import des CRA v1 ne les avait jamais incrémentés : un recalcul complet a été nécessaire.

Trois semaines plus tard, sur une copie de la production, 1 067 médiateurs avaient de nouveau un
nombre de bénéficiaires faux et 4 846 bénéficiaires un nombre d'accompagnements faux. Les CRA
créaient des bénéficiaires anonymes sans compter, la fusion de bénéficiaires oubliait l'activité,
la fusion de comptes laissait les compteurs de la source.

Une proposition de supprimer les compteurs et de compter à la lecture a été mesurée sur une copie
de la production : les statistiques devenaient 2 à 4 fois plus lentes.

- répartition des statistiques nationales : 2,4 s → 5,2 s ;
- totaux : 0,2 s → 0,85 s ; série par mois : 0,17 s → 0,65 s ;
- statistiques d'un coordinateur : +48 à +63 % ;
- tri de la liste d'administration par accompagnements : 2 ms → environ 1 s.

## Options envisagées

- Compteurs dénormalisés tenus par des triggers (option retenue)
- Supprimer les compteurs et compter à la lecture
- Des triggers par ligne qui recomptent chaque clé
- Des tables temporaires dans les triggers
- Garder l'incrément applicatif et recalculer périodiquement

## Décision

Option retenue : « Compteurs dénormalisés tenus par des triggers ».

Les compteurs restent, et PostgreSQL les tient lui-même par des triggers. L'application n'écrit
plus jamais un compteur.

### Des triggers par instruction, qui calculent par différence

Les triggers sont déclenchés une fois par instruction, pas une fois par ligne. Chacun transforme
les lignes ajoutées et retirées par l'instruction en une seule liste signée : +1 pour une ligne
ajoutée, -1 pour une ligne retirée, les deux pour une ligne modifiée. Il regroupe cette liste par
clé et fait une seule mise à jour par clé touchée, quelle que soit la taille de l'instruction.

Une activité supprimée logiquement ne compte plus. La restaurer rend sa contribution.

### Un garde qui ignore les écritures applicatives

Sur chaque table qui porte un compteur, un garde annule toute écriture du compteur qui ne vient pas
des triggers de comptage : la valeur précédente est conservée.

Le garde rend la bascule sûre. Pendant le déploiement, l'ancien conteneur peut continuer
d'incrémenter les compteurs : ses écritures sont ignorées sans erreur.

### Un compteur de plus pour les tags

Le nombre d'accompagnements par tag devient lui aussi un compteur tenu par la base. Il remplace un
recomptage à chaque affichage.

### Un recalcul complet à la mise en place

La migration qui installe le mécanisme recalcule tous les compteurs depuis les données, puis pose
les triggers.

### Le code applicatif d'incrément disparaît

Tout le code qui incrémentait ou décrémentait un compteur est supprimé, avec les utilitaires qui
n'existaient que pour lui.

### Conséquences

**Positives**

- Les compteurs ne dépendent plus des chemins d'écriture : un nouveau chemin les tient à jour sans
  y penser.
- Les lectures gardent leur coût d'avant ; le surcoût en écriture est de quelques millisecondes.
- Un test d'intégration vérifie le mécanisme sur une vraie base
  ([ADR-008](./0008-strategie-de-tests.md)) : saisie, suppression et restauration, fusion de
  bénéficiaires, transfert entre comptes, coordination, garde.

**Négatives ou à surveiller**

- **Toute écriture applicative d'un compteur est ignorée sans erreur** : un test qui veut un
  compteur doit semer les vraies lignes qui le produisent.
- **Une restauration des données seules, triggers actifs, fausse les compteurs** : le garde remet
  les valeurs insérées à zéro. Une restauration complète crée les triggers après les données et
  n'est pas touchée.
- **La règle de comptage vit en PL/pgSQL**, hors du domaine TypeScript : la changer demande une
  migration.
- **Un traitement en masse sur les tables suivies paie aussi les triggers.**

## Avantages et inconvénients des options

### Supprimer les compteurs et compter à la lecture

Les statistiques devenaient 2 à 4 fois plus lentes (voir le contexte).

### Des triggers par ligne qui recomptent chaque clé

Simples à écrire, mais un CRA déclenche alors un recomptage complet des activités de son
médiateur : 152 ms par CRA mesurées. Le calcul par différence coûte quelques millisecondes : un CRA
individuel du médiateur le plus actif passe de 9 à 16 ms.

### Des tables temporaires dans les triggers

Le droit de créer des tables temporaires n'est pas garanti sur la base de l'Entrepôt
([ADR-012](./0012-base-coop-dans-l-entrepot.md)).

### Garder l'incrément applicatif et recalculer périodiquement

Le recalcul qui a suivi l'import des CRA v1 a montré que les écarts reviennent en quelques
semaines. Un recalcul périodique laisse des compteurs faux entre deux passes.

## Plus d'informations

### Où trouver le détail

La [migration qui installe le mécanisme](../../prisma/migrations/20261116230000_tenir_les_compteurs_par_la_base/migration.sql)
porte les triggers, le garde et le recalcul initial.

Les abilities qui font varier un compteur décrivent l'effet attendu, et font foi :

- [Créer un bénéficiaire](../../src/features/beneficiaire/abilities/creer-beneficiaire/creer-beneficiaire.ability.md)
- [Importer des bénéficiaires](../../src/features/beneficiaire/abilities/importer-beneficiaires/importer-beneficiaires.ability.md)
- [Supprimer des bénéficiaires](../../src/features/beneficiaire/abilities/supprimer-beneficiaires/supprimer-beneficiaires.ability.md)
- [Anonymiser le portefeuille d'un médiateur](../../src/features/beneficiaire/abilities/anonymiser-portefeuille/anonymiser-portefeuille.ability.md)
- [Supprimer une activité de médiation](../../src/features/activites/abilities/supprimer-une-activite-de-mediation/supprimer-une-activite-de-mediation.ability.md)
- [Recevoir une notification d'usager](../../src/features/rdvsp/abilities/recevoir-webhook-usager/recevoir-webhook-usager.ability.md)

### Références

- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./0008-strategie-de-tests.md)
- [ADR-012 : La base de la coop dans le schéma `coop` de l'Entrepôt](./0012-base-coop-dans-l-entrepot.md)

### Historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |
