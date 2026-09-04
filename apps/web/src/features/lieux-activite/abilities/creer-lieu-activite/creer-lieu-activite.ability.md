# Feature: Créer un lieu d'activité

> On n'arrive sur ce formulaire qu'après une recherche par nom, adresse ou SIRET
> restée sans résultat. C'est une garde d'écran, pas une garantie : rien
> n'empêche d'y venir directement, ni d'y ressaisir un lieu que la recherche
> n'avait pas su rendre — une dénomination différente suffit. L'ability ne s'en
> remet donc pas à elle.

## Rule: Créer un lieu, c'est s'y rattacher

### Scenario: Le créateur exerce aussitôt dans le lieu créé

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* Then le lieu créé existe
* And ce médiateur exerce dans le lieu créé

## Rule: Seul un médiateur crée un lieu

### Scenario: Sans médiateur, la création est refusée

* Given un médiateur qui exerce dans un lieu
* When quelqu'un sans médiateur tente de créer un lieu
* Then la création est refusée

## Rule: On ne crée jamais un lieu que la coop connaît déjà

> La sonde de corrélation juge sur ce qui désigne un ENDROIT — la dénomination,
> à la même adresse, dans la même commune. Le lieu rendu est celui qu'on a
> rejoint, qui n'est pas toujours celui qu'on venait construire.

### Scenario: Ressaisir un lieu existant rejoint celui-ci

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* And ce médiateur ressaisit le même lieu
* Then les deux créations désignent le même lieu

### Scenario: Le lieu rejoint n'est pas dupliqué

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* And ce médiateur ressaisit le même lieu
* Then ce médiateur n'exerce qu'une fois dans le lieu créé

## Rule: « Tout public » se traduit par l'absence de public visé

### Scenario: Un lieu tout public ne vise personne en particulier

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* Then le lieu créé ne vise aucun public en particulier
