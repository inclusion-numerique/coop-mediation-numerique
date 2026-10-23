# Feature: Consulter le réseau d'un département

> Le réseau d'un département annonce combien d'acteurs et de lieux de
> l'inclusion numérique s'y trouvent, et mène à leurs annuaires.

## Rule: Un acteur compte au réseau du département où il exerce

> Un médiateur compte au réseau du département de l'un de ses lieux d'activité
> en cours ; une activité terminée ne le rattache plus au territoire.

### Scenario: Un médiateur qui exerce dans un lieu du département compte au réseau

* Given le réseau du Cantal tel qu’il est
* And un médiateur qui exerce dans un lieu du Cantal
* When on consulte le réseau du Cantal
* Then le réseau du Cantal compte 1 acteur de plus

### Scenario: Un médiateur dont l'activité a pris fin ne compte plus au réseau

* Given le réseau du Cantal tel qu’il est
* And un médiateur dont l’activité dans un lieu du Cantal a pris fin
* When on consulte le réseau du Cantal
* Then le réseau du Cantal compte 0 acteur de plus

## Rule: Seul un compte actif et inscrit compte au réseau

### Scenario: Un compte supprimé ne compte pas au réseau

* Given le réseau du Cantal tel qu’il est
* And un médiateur supprimé qui exerce dans un lieu du Cantal
* When on consulte le réseau du Cantal
* Then le réseau du Cantal compte 0 acteur de plus

### Scenario: Un compte dont l'inscription n'est pas validée ne compte pas au réseau

* Given le réseau du Cantal tel qu’il est
* And un médiateur non inscrit qui exerce dans un lieu du Cantal
* When on consulte le réseau du Cantal
* Then le réseau du Cantal compte 0 acteur de plus

## Rule: Le réseau compte les lieux de l'annuaire du département

### Scenario: Le réseau annonce les lieux de son annuaire

* Given un médiateur qui exerce dans un lieu du Cantal
* When on consulte le réseau du Cantal
* Then le réseau du Cantal compte les lieux de son annuaire

## Rule: Un département inconnu n'a pas de réseau

### Scenario: Le réseau d'un département qui n'existe pas est introuvable

* When on consulte le réseau du département « 20 »
* Then le département est inconnu
