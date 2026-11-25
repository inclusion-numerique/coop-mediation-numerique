# Fonctionnalité: Consulter le réseau d'un département

> Le réseau d'un département annonce combien d'acteurs et de lieux de
> l'inclusion numérique s'y trouvent, et mène à leurs annuaires.

## Règle: Un acteur compte au réseau du département où il exerce

> Un médiateur compte au réseau du département de l'un de ses lieux d'activité
> en cours ; une activité terminée ne le rattache plus au territoire.

### Scénario: Un médiateur qui exerce dans un lieu du département compte au réseau

* Étant donné le réseau du Cantal tel qu’il est
* Et un médiateur qui exerce dans un lieu du Cantal
* Quand on consulte le réseau du Cantal
* Alors le réseau du Cantal compte 1 acteur de plus

### Scénario: Un médiateur dont l'activité a pris fin ne compte plus au réseau

* Étant donné le réseau du Cantal tel qu’il est
* Et un médiateur dont l’activité dans un lieu du Cantal a pris fin
* Quand on consulte le réseau du Cantal
* Alors le réseau du Cantal compte 0 acteur de plus

## Règle: Seul un compte actif et inscrit compte au réseau

### Scénario: Un compte supprimé ne compte pas au réseau

* Étant donné le réseau du Cantal tel qu’il est
* Et un médiateur supprimé qui exerce dans un lieu du Cantal
* Quand on consulte le réseau du Cantal
* Alors le réseau du Cantal compte 0 acteur de plus

### Scénario: Un compte dont l'inscription n'est pas validée ne compte pas au réseau

* Étant donné le réseau du Cantal tel qu’il est
* Et un médiateur non inscrit qui exerce dans un lieu du Cantal
* Quand on consulte le réseau du Cantal
* Alors le réseau du Cantal compte 0 acteur de plus

## Règle: Le réseau compte les lieux de l'annuaire du département

### Scénario: Le réseau annonce les lieux de son annuaire

* Étant donné un médiateur qui exerce dans un lieu du Cantal
* Quand on consulte le réseau du Cantal
* Alors le réseau du Cantal compte les lieux de son annuaire

## Règle: Un département inconnu n'a pas de réseau

### Scénario: Le réseau d'un département qui n'existe pas est introuvable

* Quand on consulte le réseau du département « 20 »
* Alors le département est inconnu
