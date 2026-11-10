# Feature: Rechercher des lieux à ajouter

> Le champ d'ajout de lieux, dans la gestion des lieux comme à l'inscription,
> suggère des lieux venus de trois sources : la coop, la cartographie nationale
> et, en dernier recours, l'annuaire des entreprises.

## Rule: La recherche ne propose de la coop que des lieux exploitables

### Scenario: Un lieu de la coop est proposé par son nom

* Given un lieu « Médiathèque des Minimes » à trouver dans la coop
* When on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Then la recherche propose ce lieu à trouver

### Scenario: Un lieu sans adresse reconnue par la BAN n'est pas proposé

* Given un lieu « Médiathèque des Minimes » à trouver dans la coop
* And ce lieu à trouver n'a pas d'adresse reconnue par la BAN
* When on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Then la recherche ne propose pas ce lieu à trouver

### Scenario: Un lieu supprimé n'est pas proposé

* Given un lieu « Médiathèque des Minimes » à trouver dans la coop
* And ce lieu à trouver est supprimé
* When on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Then la recherche ne propose pas ce lieu à trouver

## Rule: Un lieu que la coop connaît n'est proposé qu'une fois

> La cartographie nationale connaît aussi les lieux que la coop y a publiés.
> Le lieu de la coop prime, avec les corrections que ses médiateurs y ont
> portées.

### Scenario: Un lieu de la coop connu de la cartographie n'est proposé que par la coop

* Given un lieu « Médiathèque des Minimes » à trouver dans la coop
* And la cartographie nationale connaît ce lieu à trouver
* When on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Then la recherche propose ce lieu à trouver une seule fois
