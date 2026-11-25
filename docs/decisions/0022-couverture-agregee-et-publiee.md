---
status: "accepted"
date: 2026-11-25
decision-makers:
  - Marc Gavanier
---

# Couverture agrégée et publiée avec la documentation

## Context and Problem Statement

Trois suites de tests exercent le code : les tests unitaires, les tests
d'intégration et les scénarios Cucumber. Un service externe recevait leurs
trois couvertures, les additionnait fichier par fichier, affichait le détail
de chaque fichier et fournissait le badge du README.

Ce total était faux. Vitest projette la couverture du moteur V8 sur l'arbre
syntaxique du source : seules les lignes exécutables comptent. L'outil qui
mesurait Cucumber la projetait ligne par ligne : il comptait les
commentaires, les types et les signatures, marquait les commentaires comme
exécutés, et comptait toutes les lignes physiques des fichiers jamais
chargés. Additionner les deux mélangeait deux unités de mesure : le service
annonçait 70 % de lignes couvertes, quand les tests unitaires seuls en
couvrent 30 %.

La documentation publiée ([ADR-021](./0021-documentation-generee-et-publiee.md))
ne montrait, elle, que la couverture unitaire.

## Decision Drivers

- Un chiffre juste : les trois couvertures mesurées de la même façon avant
  d'être additionnées.
- Les mêmes services que le service externe : l'agrégation des suites, le
  détail fichier par fichier, le badge.
- Rien qui dépende d'un service tiers au moment de consulter : un site
  statique.
- Les outils standard du format plutôt qu'un rapport maison.

## Considered Options

- Mesurer Cucumber avec le moteur de projection de Vitest (option retenue)
- Mesurer les trois suites avec un outil tiers de couverture V8
- Garder l'outil de Cucumber et ne retenir que les lignes que Vitest déclare
  exécutables

## Decision Outcome

Option retenue : « Mesurer Cucumber avec le moteur de projection de
Vitest ».

### Une seule façon de mesurer

Les scénarios Cucumber tournent sous l'inspecteur de Node, qui relève la
couverture V8 et le code réellement exécuté. Une conversion la projette
ensuite avec la bibliothèque qu'utilise Vitest, sur le même périmètre de
fichiers, partagé entre les deux. Les trois couvertures comptent alors les
mêmes lignes, les mêmes branches et les mêmes fonctions, et s'additionnent.

### Des outils standard pour le reste

La fusion des trois couvertures et le rapport fichier par fichier passent
par les outils de référence du format lcov. Le badge est une image générée
au même moment, servie avec le rapport.

### Publiés avec la documentation

La fusion a lieu dans la CI, après les trois suites. Sur la branche
principale, le rapport et le badge rejoignent le site de documentation, qui
se publie désormais depuis la CI : il n'est republié que lorsque les trois
suites ont réussi. Sur une branche de travail, le total s'affiche dans le
résumé du run et le rapport reste téléchargeable.

Le service externe n'est plus utilisé.

### Consequences

- Good, because le total de couverture est juste et ne dépend plus d'un
  service tiers.
- Good, because le rapport fichier par fichier se lit au même endroit que le
  reste de la documentation.
- Good, because les suites restent libres de leur lanceur : seule la mesure
  est commune.

- Bad, because la conversion de la couverture de Cucumber est du code du
  dépôt, qui suit l'interface d'une bibliothèque et le format des source
  maps du chargeur TypeScript.
- Bad, because les deux chargeurs TypeScript ne placent pas toujours le
  début d'une déclaration sur la même ligne : sur les fichiers que Cucumber
  charge, la fusion compte environ 2 % de lignes de plus que chaque suite
  prise seule.
- Bad, because l'évolution de la couverture d'une branche par rapport à la
  branche principale et l'historique ne sont plus affichés.
- Bad, because une suite en échec sur la branche principale empêche de
  republier la documentation ce jour-là.

## Pros and Cons of the Options

### Mesurer les trois suites avec un outil tiers de couverture V8

Un outil fait précisément pour fusionner des couvertures V8 venues de
lanceurs différents, sans code dans le dépôt. Mais Vitest ne mesurerait plus
avec son fournisseur officiel, et l'outil repose sur un seul mainteneur.

### Garder l'outil de Cucumber et ne retenir que les lignes exécutables

Le chiffre des lignes deviendrait comparable, mais les fonctions et les
branches mesurées par Cucumber seraient perdues, et le filtrage resterait
une approximation.

## More Information

### Où trouver le détail

Les commandes de mesure et de fusion sont décrites dans
[`AGENTS.md`](../../AGENTS.md).

### Références

- [ADR-021 : Documentation générée et publiée](./0021-documentation-generee-et-publiee.md)
- [ast-v8-to-istanbul](https://github.com/AriPerkkio/ast-v8-to-istanbul)
- [LCOV](https://github.com/linux-test-project/lcov)
- [badge-maker](https://github.com/badges/shields/tree/master/badge-maker)

### Historique

- 2026-11-25, Marc Gavanier : rédaction initiale de l'ADR.
