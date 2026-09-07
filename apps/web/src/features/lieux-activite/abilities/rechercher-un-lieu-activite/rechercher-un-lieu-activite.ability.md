# Feature: Rechercher un de ses lieux d'activité

> La recherche ne porte que sur les lieux où le médiateur exerce : c'est un
> choix parmi les siens, pas une exploration de l'annuaire.

## Rule: Seuls les lieux où l'on exerce sont proposés

### Scenario: Le lieu d'un autre médiateur n'est pas proposé

* Given un médiateur qui exerce dans un lieu
* When ce médiateur cherche « Maison »
* Then la recherche propose ce lieu
* And un médiateur étranger qui cherche « Maison » ne trouve rien

### Scenario: Un lieu quitté n'est plus proposé

* Given un médiateur qui exerce dans un lieu
* When ce médiateur se retire de ce lieu puis cherche « Maison »
* Then la recherche ne propose rien

## Rule: La recherche porte sur le nom du lieu

### Scenario: Une recherche sans correspondance ne propose rien

* Given un médiateur qui exerce dans un lieu
* When ce médiateur cherche « Piscine »
* Then la recherche ne propose rien
