# Feature: Régler la visibilité du médiateur sur la cartographie

> Le réglage porte sur le profil — nom, courriel, téléphone —, pas sur les lieux
> d'exercice : un médiateur caché disparaît de la fiche des lieux où il exerce,
> les lieux restent publiés.

## Rule: Le médiateur choisit lui-même d'être visible ou non

### Scenario: Le médiateur se retire de la cartographie

* Given un médiateur visible sur la cartographie
* When ce médiateur se rend invisible sur la cartographie
* Then le profil de ce médiateur n'est plus visible sur la cartographie
* And la date de modification de ce médiateur est celle du réglage

### Scenario: Le médiateur masqué par un administrateur se rend de nouveau visible

* Given un médiateur visible sur la cartographie
* And un administrateur a rendu ce médiateur invisible sur la cartographie
* When ce médiateur se rend visible sur la cartographie
* Then le profil de ce médiateur est visible sur la cartographie

## Rule: Un administrateur retire le profil d'un médiateur qui ne peut plus le faire

> Personne n'ayant plus accès à son compte, rupture ou fin de contrat non
> déclarée : le profil resterait affiché sans que personne ne réponde.

### Scenario: L'administrateur retire le profil d'un médiateur de la cartographie

* Given un médiateur visible sur la cartographie
* When un administrateur rend ce médiateur invisible sur la cartographie
* Then le profil de ce médiateur n'est plus visible sur la cartographie
* And la date de modification de ce médiateur est celle du réglage

## Rule: Le réglage ne porte que sur un médiateur dont le compte existe

### Scenario: Le médiateur d'un compte supprimé est introuvable

* Given un médiateur visible sur la cartographie
* And le compte de ce médiateur est supprimé
* When un administrateur rend ce médiateur invisible sur la cartographie
* Then le réglage de la visibilité échoue car le médiateur est introuvable
* And le profil de ce médiateur est visible sur la cartographie
