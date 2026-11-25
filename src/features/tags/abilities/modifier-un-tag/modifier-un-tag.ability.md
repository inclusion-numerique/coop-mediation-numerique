# Fonctionnalité: Modifier un tag

> Modifier un tag change son nom et sa description. Sa visibilité, elle, ne
> change pas.

## Règle: Celui qui gère le tag le renomme et le décrit

### Scénario: Le médiateur renomme son tag personnel

* Étant donné un médiateur qui possède le tag personnel "Ateliers"
* Quand ce médiateur renomme son tag en "Ateliers numériques" décrit par "Le mardi matin"
* Alors la modification du tag réussit
* Et le tag s'appelle désormais "Ateliers numériques" et se décrit par "Le mardi matin"

### Scénario: Le médiateur retire la description de son tag

* Étant donné un médiateur qui possède le tag personnel "Ateliers"
* Quand ce médiateur renomme son tag en "Ateliers" sans description
* Alors la modification du tag réussit
* Et le tag n'a plus de description

## Règle: Personne ne modifie un tag qu'il ne gère pas

### Scénario: Un médiateur ne modifie pas le tag personnel d'un autre

* Étant donné un médiateur qui possède le tag personnel "Ateliers"
* Quand un autre médiateur renomme ce tag en "Piraté"
* Alors la modification du tag est refusée
* Et le tag s'appelle toujours "Ateliers"
