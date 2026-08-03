# Feature: Lister les employeuses

Parcours d'administration : on y traverse l'ensemble des employeuses, page par
page, plutôt que d'en choisir une.

Les scénarios travaillent sur un jeu nommé « Zzz » et filtrent dessus : la table
des employeuses est peuplée par l'Entrepôt, on ne peut pas la supposer vide.

## Rule: La liste se parcourt par pages

### Scenario: Une page plus petite que le total

* Given l'annuaire contient les employeuses "Zzz Alpha", "Zzz Bravo" et "Zzz Charlie"
* When je liste les employeuses correspondant à "Zzz" par pages de 2
* Then la page listée contient 2 employeuses
* And le total annoncé est de 3 employeuses
* And le nombre de pages annoncé est 2

### Scenario: Les employeuses sont ordonnées par nom

* Given l'annuaire contient les employeuses "Zzz Charlie", "Zzz Alpha" et "Zzz Bravo"
* When je liste les employeuses correspondant à "Zzz" par pages de 10
* Then la première employeuse listée est "Zzz Alpha"

## Rule: La liste dit combien de personnes chaque employeuse emploie

### Scenario: Une employeuse avec deux personnes rattachées

* Given l'annuaire contient les employeuses "Zzz Alpha", "Zzz Bravo" et "Zzz Charlie"
* And 2 personnes sont rattachées à "Zzz Alpha"
* When je liste les employeuses correspondant à "Zzz" par pages de 10
* Then "Zzz Alpha" emploie 2 personnes dans la liste
* And "Zzz Bravo" emploie 0 personne dans la liste

## Rule: La recherche filtre la liste

### Scenario: Recherche sur une partie du nom

* Given l'annuaire contient les employeuses "Zzz Alpha", "Zzz Bravo" et "Zzz Charlie"
* When je liste les employeuses correspondant à "Zzz Brav" par pages de 10
* Then la page listée contient 1 employeuse
* And la première employeuse listée est "Zzz Bravo"
