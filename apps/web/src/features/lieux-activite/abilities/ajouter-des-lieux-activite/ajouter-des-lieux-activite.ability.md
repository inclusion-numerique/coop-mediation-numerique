# Feature: Ajouter des lieux d'activité

> Le médiateur constitue un panier — des lieux trouvés dans la coop, d'autres
> venus de la cartographie nationale, d'autres qu'il saisit lui-même — puis
> valide l'ensemble d'un coup.

## Rule: Ajouter un lieu, c'est y exercer

### Scenario: Un lieu déjà référencé rejoint l'activité du médiateur

* Given un médiateur rattaché à deux lieux d'activité
* And un lieu référencé dans la coop
* When ce médiateur ajoute ce lieu référencé
* Then ce médiateur exerce dans ce lieu référencé

### Scenario: Un lieu que rien n'identifie est créé puis rejoint

* Given un médiateur rattaché à deux lieux d'activité
* When ce médiateur ajoute un lieu saisi « Tiers-lieu du Port »
* Then le lieu « Tiers-lieu du Port » existe
* And ce médiateur exerce dans le lieu « Tiers-lieu du Port »

## Rule: On n'ajoute pas deux fois le même lieu

### Scenario: Un lieu où l'on exerce déjà n'est pas ajouté une seconde fois

* Given un médiateur rattaché à deux lieux d'activité
* When ce médiateur ajoute un lieu où il exerce déjà
* Then ce médiateur n'exerce toujours que dans deux lieux

### Scenario: Le même lieu deux fois dans le panier ne compte qu'une fois

* Given un médiateur rattaché à deux lieux d'activité
* And un lieu référencé dans la coop
* When ce médiateur ajoute deux fois ce lieu référencé
* Then ce médiateur exerce dans trois lieux

## Rule: Un lieu saisi qui désigne un lieu connu ne crée pas de doublon

> La corrélation s'en remet au standard partagé : même adresse, dénomination
> voisine, c'est le même endroit.

### Scenario: Une saisie qui retrouve un lieu existant s'y rattache

* Given un médiateur rattaché à deux lieux d'activité
* And un lieu référencé dans la coop
* When ce médiateur saisit un lieu à la même adresse que ce lieu référencé
* Then aucun lieu n'a été créé
* And ce médiateur exerce dans ce lieu référencé

## Rule: Seul un médiateur ajoute des lieux

### Scenario: Sans médiateur, l'ajout est refusé

* Given un médiateur rattaché à deux lieux d'activité
* When quelqu'un sans médiateur tente d'ajouter un lieu
* Then l'ajout est refusé

### Scenario: Un panier vide n'est pas une demande

* Given un médiateur rattaché à deux lieux d'activité
* When ce médiateur valide un panier vide
* Then l'ajout est refusé
