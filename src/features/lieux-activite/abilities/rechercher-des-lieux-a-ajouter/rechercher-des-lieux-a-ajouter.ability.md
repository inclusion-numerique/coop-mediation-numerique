# Fonctionnalité: Rechercher des lieux à ajouter

> Le champ d'ajout de lieux, dans la gestion des lieux comme à l'inscription,
> suggère des lieux venus de trois sources : la coop, la cartographie nationale
> et, en dernier recours, l'annuaire des entreprises.

## Règle: La recherche ne propose de la coop que des lieux exploitables

### Scénario: Un lieu de la coop est proposé par son nom

* Étant donné un lieu « Médiathèque des Minimes » à trouver dans la coop
* Quand on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Alors la recherche propose ce lieu à trouver

### Scénario: Un lieu sans adresse reconnue par la BAN n'est pas proposé

* Étant donné un lieu « Médiathèque des Minimes » à trouver dans la coop
* Et ce lieu à trouver n'a pas d'adresse reconnue par la BAN
* Quand on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Alors la recherche ne propose pas ce lieu à trouver

### Scénario: Un lieu supprimé n'est pas proposé

* Étant donné un lieu « Médiathèque des Minimes » à trouver dans la coop
* Et ce lieu à trouver est supprimé
* Quand on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Alors la recherche ne propose pas ce lieu à trouver

## Règle: Un lieu que la coop connaît n'est proposé qu'une fois

> La cartographie nationale connaît aussi les lieux que la coop y a publiés.
> Le lieu de la coop prime, avec les corrections que ses médiateurs y ont
> portées.

### Scénario: Un lieu de la coop connu de la cartographie n'est proposé que par la coop

* Étant donné un lieu « Médiathèque des Minimes » à trouver dans la coop
* Et la cartographie nationale connaît ce lieu à trouver
* Quand on cherche « Médiathèque des Minimes » parmi les lieux à ajouter
* Alors la recherche propose ce lieu à trouver une seule fois
