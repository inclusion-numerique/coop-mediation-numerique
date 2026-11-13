# Feature: Lire les tags visibles

> Avant d'enregistrer les tags d'une activité, on relit ceux que l'acteur a
> choisis : seuls les tags qu'il peut voir et qui existent encore sont rendus.

## Rule: Seuls les tags visibles et non supprimés sont lus

### Scenario: Le médiateur lit son tag mais pas celui d'un autre ni un tag supprimé

* Given un médiateur qui a choisi son tag "Café numérique", le tag personnel "Café pirate" d’un autre médiateur et son tag supprimé "Café fermé"
* When les tags choisis par ce médiateur sont relus
* Then seul le tag "Café numérique" est lu

## Rule: La barre des statistiques propose tous les tags visibles, et eux seuls

### Scenario: Le médiateur voit son tag mais pas celui d'un autre ni un tag supprimé

* Given un médiateur qui a choisi son tag "Café numérique", le tag personnel "Café pirate" d’un autre médiateur et son tag supprimé "Café fermé"
* When tous les tags visibles par ce médiateur sont lus
* Then le tag "Café numérique" est proposé
* And ni "Café pirate" ni "Café fermé" ne sont proposés
