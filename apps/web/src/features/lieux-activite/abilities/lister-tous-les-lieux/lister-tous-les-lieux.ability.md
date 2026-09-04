# Feature: Lister tous les lieux d'activité

> L'annuaire complet, du point de vue de l'administration : celui où l'on
> cherche un lieu pour le corriger ou le fusionner, et non celui de ses propres
> lieux d'exercice.

## Rule: La recherche ratisse tout ce qui désigne le lieu

> Nom, SIRET, adresse, commune et code postal. Qui cherche un lieu ne sait pas
> toujours sous quel libellé il a été enregistré, mais il connaît au moins une
> de ces cinq choses.

### Scenario: Trouver un lieu par sa dénomination

* Given trois lieux à administrer, dont deux à la même adresse
* When l’administration cherche « Cyberbase du Port »
* Then un seul lieu est trouvé

### Scenario: Trouver des lieux par leur code postal

* Given trois lieux à administrer, dont deux à la même adresse
* When l’administration cherche « 17300 »
* Then deux lieux sont trouvés

### Scenario: Trouver un lieu par son SIRET

* Given trois lieux à administrer, dont deux à la même adresse
* When l’administration cherche le SIRET du premier lieu
* Then un seul lieu est trouvé

## Rule: Un lieu supprimé ne s'administre plus

### Scenario: Le lieu retiré sort de la liste

* Given trois lieux à administrer, dont deux à la même adresse
* And le premier de ces lieux est supprimé
* When l’administration cherche « 17300 »
* Then un seul lieu est trouvé

## Rule: Le total ne dépend pas de la recherche

> C'est le repère qui donne son sens au nombre de résultats : « 9 trouvés » ne
> dit rien sans « sur 12 750 ».

### Scenario: Le total reste celui de la coop entière

* Given trois lieux à administrer, dont deux à la même adresse
* When l’administration cherche « Cyberbase du Port »
* Then le total annoncé dépasse le nombre de lieux trouvés
