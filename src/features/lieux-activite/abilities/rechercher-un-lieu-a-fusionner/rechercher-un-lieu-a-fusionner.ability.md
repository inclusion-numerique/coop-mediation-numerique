# Fonctionnalité: Rechercher un lieu à fusionner

> Pour fusionner deux fiches, l'administration cherche d'abord celle à absorber.
> La recherche est réservée à l'administration, comme la fusion : elle voit
> tous les lieux de la coop, sans égard pour ceux où l'on exerce.

## Règle: La recherche propose les lieux de la coop dont le nom correspond

### Scénario: Un lieu cherché par son nom est proposé

* Étant donné un lieu « Cyberbase des Docks » à fusionner
* Quand l'administration cherche « Cyberbase des Docks » parmi les lieux à fusionner
* Alors la recherche propose ce lieu à fusionner

## Règle: Un lieu supprimé ne se fusionne plus

### Scénario: Un lieu supprimé n'est pas proposé

* Étant donné un lieu « Cyberbase des Docks » à fusionner
* Et ce lieu à fusionner est supprimé
* Quand l'administration cherche « Cyberbase des Docks » parmi les lieux à fusionner
* Alors la recherche ne propose pas ce lieu à fusionner
