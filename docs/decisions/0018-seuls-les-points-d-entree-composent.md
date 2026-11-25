---
status: "accepted"
date: 2026-11-25
decision-makers:
  - Marc Gavanier
---

# Seuls les points d'entrée composent

## Context and Problem Statement

L'[ADR-004](./0004-architecture-par-features-et-abilities.md) découpe le code
en features et en abilities, qui déclarent leurs besoins par des ports. Il
fallait décider où ces ports reçoivent leurs implémentations.

Une première réponse a été le binding : un fichier, dans la feature, qui
branchait les implémentations d'une ability sur ses ports, et que les points
d'entrée importaient tout câblé. À l'usage, il posait plusieurs problèmes :

- Un binding ne valait que pour sa feature. Or un assemblage croise souvent
  plusieurs features : la composition qui en dépasse une n'avait pas de place.
- Beaucoup de bindings n'avaient qu'un seul appelant. Ils ajoutaient un
  détour sans rien mutualiser.
- De la logique s'y était glissée : des règles de la feature vivaient dans un
  fichier de câblage, loin de leur domaine.
- Des mesures de durée s'y ajoutaient, mêlées au câblage.

Les implémentations elles-mêmes s'appelaient entre techniques : une requête
de base appelait l'envoi d'un courriel, un classeur lisait le type de ligne
d'une requête. Une technique dépendait ainsi d'une autre sans que rien ne le
montre.

## Decision Drivers

- Aucune dépendance entre features, ni entre abilities : la règle de
  l'ADR-004 ne se négocie pas.
- La composition doit pouvoir croiser plusieurs features.
- Un comportement se lit dans sa feature, pas dans un fichier de câblage.

## Considered Options

- Seuls les points d'entrée composent (option retenue)
- Un binding par feature
- Un dossier de composition à la racine du code

## Decision Outcome

Option retenue : « Seuls les points d'entrée composent ».

C'est le principe de la racine de composition : l'application ne s'assemble
qu'à ses points d'entrée. Chaque point d'entrée est sa propre racine : une
route, une page, un layout, une server action, un job, une commande du CLI,
une étape de scénario, un test.

### Une feature ne câble jamais ses abilities

Une feature fournit des ports, des domaines et des implémentations ; elle
n'assemble rien. Le point d'entrée prend les implémentations dont il a
besoin, de sa feature ou d'autres, et les branche sur les ports.

### Le câblage dupliqué entre entrées est accepté

Deux entrées qui composent la même chose répètent le même câblage. Cette
duplication est voulue : elle garde chaque entrée lisible seule, et aucun
fichier intermédiaire ne se met à porter de la logique.

### La logique retourne dans sa feature

Ce qui décidait quelque chose dans un fichier de câblage rejoint le domaine
ou l'implémentation de sa feature. Le câblage ne fait que brancher.

### Le domaine est le pivot entre les techniques

Une implémentation ne lit que son domaine et sa propre technique. Quand une
technique a besoin de ce qu'une autre produit, elle part d'un type du domaine,
pas du type de l'autre technique. Quand une opération enchaîne deux
techniques, c'est le point d'entrée qui appelle l'une puis l'autre, ou qui
injecte l'une dans l'autre comme un port typé par le domaine.

### Les middlewares composent comme une entrée

Un middleware enveloppe un point d'entrée et en partage le rôle : il peut
assembler les implémentations de sa feature, par exemple pour lire
l'utilisateur de la session.

### Côté client, l'injection passe par des clés nommées

Un composant client reçoit ce qu'il appelle par une clé d'injection, que la
route lie à la valeur. La clé est identifiée par son nom : deux features qui
déclarent une clé du même nom partagent la même injection sans s'importer.
C'est ainsi qu'une feature lie un service que les composants d'une autre
utilisent.

### Consequences

- Good, because la composition peut croiser autant de features que
  nécessaire, sans qu'aucune feature n'importe l'autre.
- Good, because chaque point d'entrée dit, en un seul endroit, ce qu'il
  assemble.
- Good, because une technique se remplace sans toucher aux autres : elles ne
  se connaissent pas.

- Bad, because le même câblage se répète d'une entrée à l'autre, et un
  changement de signature se propage à toutes.
- Bad, because une clé partagée par son nom n'est vérifiée par aucun import :
  une faute de frappe dans le nom ne se voit qu'à l'exécution.
- Neutral, because les mesures de durée retirées avec les bindings relèvent
  de la télémétrie.

### Confirmation

Les règles d'imports vérifiées par l'outil refusent qu'une feature importe
une autre feature, qu'une ability importe une autre ability, et qu'une
implémentation importe une autre technique.

## Pros and Cons of the Options

### Un binding par feature

Il centralisait le câblage d'une ability, mais seulement à l'intérieur de sa
feature : il ne savait pas composer plusieurs features. Il a attiré de la
logique et des mesures, et souvent servi un seul appelant.

### Un dossier de composition à la racine du code

Il aurait accueilli les assemblages qui croisent les features. Mais il
devient vite un second domaine, qui connaît toutes les features à la fois et
que tout le monde importe. Il ne fait que déplacer le binding hors des
features.

## More Information

### Où trouver le détail

Les règles normatives sur la composition et l'injection sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).

### Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [ADR-006 : Server actions et injection, à la place de tRPC](./0006-server-actions-et-injection.md)
- [ADR-007 : `app/` ne contient que le routage Next](./0007-app-ne-contient-que-le-routage.md)
- [Mark Seemann, Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)

### Historique

- 2026-11-25, Marc Gavanier : rédaction initiale de l'ADR.
