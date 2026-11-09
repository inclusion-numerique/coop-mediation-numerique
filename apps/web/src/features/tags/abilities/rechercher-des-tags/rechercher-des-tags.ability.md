# Feature: Rechercher des tags

> Lors de la saisie d'une activité, la recherche de tags propose les tags que
> l'acteur peut voir, ceux qu'il utilise le plus en premier.

## Rule: La recherche ne propose que les tags visibles et non encore choisis

### Scenario: Le médiateur retrouve ses tags mais pas ceux d'un autre

* Given un médiateur qui cherche parmi ses tags "Café numérique" et "Café seniors"
* And le tag personnel "Café pirate" d’un autre médiateur
* When ce médiateur cherche "café" sans exclure de tag
* Then la recherche de tags propose "Café numérique" et "Café seniors"
* And la recherche de tags ne propose pas "Café pirate"

### Scenario: Un tag déjà choisi n'est plus proposé

* Given un médiateur qui cherche parmi ses tags "Café numérique" et "Café seniors"
* When ce médiateur cherche "café" en excluant "Café numérique"
* Then la recherche de tags propose "Café seniors"
* And la recherche de tags ne propose pas "Café numérique"

## Rule: Les tags les plus utilisés par l'acteur viennent en premier

### Scenario: Le tag le plus utilisé passe devant l'ordre alphabétique

* Given un médiateur qui cherche parmi ses tags "Café numérique" et "Café seniors"
* And ce médiateur a utilisé "Café seniors" dans une activité
* When ce médiateur cherche "café" sans exclure de tag
* Then "Café seniors" est proposé avant "Café numérique"
