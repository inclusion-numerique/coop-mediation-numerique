# Feature: Créer un lieu d'activité

> On ne crée un lieu que lorsque la recherche par nom, adresse ou SIRET n'a
> rien rendu : il n'a donc ni immatriculation, ni correspondance dans la
> cartographie nationale.

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

## Rule: « Tout public » se traduit par l'absence de public visé

### Scenario: Un lieu tout public ne vise personne en particulier

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* Then le lieu créé ne vise aucun public en particulier
