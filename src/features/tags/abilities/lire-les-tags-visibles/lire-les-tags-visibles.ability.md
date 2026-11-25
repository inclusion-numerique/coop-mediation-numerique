# Fonctionnalité: Lire les tags visibles

> Avant d'enregistrer les tags d'une activité, on relit ceux que l'acteur a
> choisis : seuls les tags qu'il peut voir et qui existent encore sont rendus.

## Règle: Seuls les tags visibles et non supprimés sont lus

### Scénario: Le médiateur lit son tag mais pas celui d'un autre ni un tag supprimé

* Étant donné un médiateur qui a choisi son tag "Café numérique", le tag personnel "Café pirate" d’un autre médiateur et son tag supprimé "Café fermé"
* Quand les tags choisis par ce médiateur sont relus
* Alors seul le tag "Café numérique" est lu

## Règle: La barre des statistiques propose tous les tags visibles, et eux seuls

### Scénario: Le médiateur voit son tag mais pas celui d'un autre ni un tag supprimé

* Étant donné un médiateur qui a choisi son tag "Café numérique", le tag personnel "Café pirate" d’un autre médiateur et son tag supprimé "Café fermé"
* Quand tous les tags visibles par ce médiateur sont lus
* Alors le tag "Café numérique" est proposé
* Et ni "Café pirate" ni "Café fermé" ne sont proposés

## Règle: Les statistiques de l'administration proposent les tags collectifs encore actifs

### Scénario: Un tag départemental est proposé, un tag personnel et un tag collectif supprimé ne le sont pas

* Étant donné le tag départemental "Rhône numérique" du "69", le tag collectif supprimé "Ancien réseau" et un tag personnel "Café privé"
* Quand les tags collectifs sont lus
* Alors le tag "Rhône numérique" est proposé
* Et ni "Ancien réseau" ni "Café privé" ne sont proposés
