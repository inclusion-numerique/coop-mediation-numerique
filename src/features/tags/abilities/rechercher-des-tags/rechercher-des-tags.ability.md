# Fonctionnalité: Rechercher des tags

> Lors de la saisie d'une activité, la recherche de tags propose les tags que
> l'acteur peut voir, ceux qu'il utilise le plus en premier.

## Règle: La recherche ne propose que les tags visibles et non encore choisis

### Scénario: Le médiateur retrouve ses tags mais pas ceux d'un autre

* Étant donné un médiateur qui cherche parmi ses tags "Café numérique" et "Café seniors"
* Et le tag personnel "Café pirate" d’un autre médiateur
* Quand ce médiateur cherche "café" sans exclure de tag
* Alors la recherche de tags propose "Café numérique" et "Café seniors"
* Et la recherche de tags ne propose pas "Café pirate"

### Scénario: Un tag déjà choisi n'est plus proposé

* Étant donné un médiateur qui cherche parmi ses tags "Café numérique" et "Café seniors"
* Quand ce médiateur cherche "café" en excluant "Café numérique"
* Alors la recherche de tags propose "Café seniors"
* Et la recherche de tags ne propose pas "Café numérique"

## Règle: Les tags les plus utilisés par l'acteur viennent en premier

### Scénario: Le tag le plus utilisé passe devant l'ordre alphabétique

* Étant donné un médiateur qui cherche parmi ses tags "Café numérique" et "Café seniors"
* Et ce médiateur a utilisé "Café seniors" dans une activité
* Quand ce médiateur cherche "café" sans exclure de tag
* Alors "Café seniors" est proposé avant "Café numérique"
