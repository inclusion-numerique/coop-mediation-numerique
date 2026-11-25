# Fonctionnalité: Lister les employeuses

Parcours d'administration : on y traverse l'ensemble des employeuses, page par
page, plutôt que d'en choisir une.

Les scénarios travaillent sur un jeu nommé « Zzz » et filtrent dessus : la table
des employeuses est peuplée par l'Entrepôt, on ne peut pas la supposer vide.

## Règle: La liste se parcourt par pages

### Scénario: Une page plus petite que le total

* Étant donné l'annuaire contient les employeuses "Zzz Alpha", "Zzz Bravo" et "Zzz Charlie"
* Quand je liste les employeuses correspondant à "Zzz" par pages de 2
* Alors la page listée contient 2 employeuses
* Et le total annoncé est de 3 employeuses
* Et le nombre de pages annoncé est 2

### Scénario: Les employeuses sont ordonnées par nom

* Étant donné l'annuaire contient les employeuses "Zzz Charlie", "Zzz Alpha" et "Zzz Bravo"
* Quand je liste les employeuses correspondant à "Zzz" par pages de 10
* Alors la première employeuse listée est "Zzz Alpha"

## Règle: La liste dit combien de personnes chaque employeuse emploie

### Scénario: Une employeuse avec deux personnes rattachées

* Étant donné l'annuaire contient les employeuses "Zzz Alpha", "Zzz Bravo" et "Zzz Charlie"
* Et 2 personnes sont rattachées à "Zzz Alpha"
* Quand je liste les employeuses correspondant à "Zzz" par pages de 10
* Alors "Zzz Alpha" emploie 2 personnes dans la liste
* Et "Zzz Bravo" emploie 0 personne dans la liste

## Règle: La recherche filtre la liste

### Scénario: Recherche sur une partie du nom

* Étant donné l'annuaire contient les employeuses "Zzz Alpha", "Zzz Bravo" et "Zzz Charlie"
* Quand je liste les employeuses correspondant à "Zzz Brav" par pages de 10
* Alors la page listée contient 1 employeuse
* Et la première employeuse listée est "Zzz Bravo"
