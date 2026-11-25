# Fonctionnalité: Régler la visibilité du médiateur sur la cartographie

> Le réglage porte sur le profil — nom, courriel, téléphone —, pas sur les lieux
> d'exercice : un médiateur caché disparaît de la fiche des lieux où il exerce,
> les lieux restent publiés.

## Règle: Le médiateur choisit lui-même d'être visible ou non

### Scénario: Le médiateur se retire de la cartographie

* Étant donné un médiateur visible sur la cartographie
* Quand ce médiateur se rend invisible sur la cartographie
* Alors le profil de ce médiateur n'est plus visible sur la cartographie
* Et la date de modification de ce médiateur est celle du réglage
* Et le choix de visibilité de ce médiateur est daté du réglage

### Scénario: Le médiateur masqué par un administrateur se rend de nouveau visible

* Étant donné un médiateur visible sur la cartographie
* Et un administrateur a rendu ce médiateur invisible sur la cartographie
* Quand ce médiateur se rend visible sur la cartographie
* Alors le profil de ce médiateur est visible sur la cartographie

## Règle: Un administrateur retire le profil d'un médiateur qui ne peut plus le faire

> Personne n'ayant plus accès à son compte, rupture ou fin de contrat non
> déclarée : le profil resterait affiché sans que personne ne réponde.

### Scénario: L'administrateur retire le profil d'un médiateur de la cartographie

* Étant donné un médiateur visible sur la cartographie
* Quand un administrateur rend ce médiateur invisible sur la cartographie
* Alors le profil de ce médiateur n'est plus visible sur la cartographie
* Et la date de modification de ce médiateur est celle du réglage
* Et le choix de visibilité de ce médiateur est daté du réglage

## Règle: Le réglage ne porte que sur un médiateur dont le compte existe

### Scénario: Le médiateur d'un compte supprimé est introuvable

* Étant donné un médiateur visible sur la cartographie
* Et le compte de ce médiateur est supprimé
* Quand un administrateur rend ce médiateur invisible sur la cartographie
* Alors le réglage de la visibilité échoue car le médiateur est introuvable
* Et le profil de ce médiateur est visible sur la cartographie
