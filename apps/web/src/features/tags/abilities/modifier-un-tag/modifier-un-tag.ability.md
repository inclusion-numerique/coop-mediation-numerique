# Feature: Modifier un tag

> Modifier un tag change son nom et sa description. Sa visibilité, elle, ne
> change pas.

## Rule: Celui qui gère le tag le renomme et le décrit

### Scenario: Le médiateur renomme son tag personnel

* Given un médiateur qui possède le tag personnel "Ateliers"
* When ce médiateur renomme son tag en "Ateliers numériques" décrit par "Le mardi matin"
* Then la modification du tag réussit
* And le tag s'appelle désormais "Ateliers numériques" et se décrit par "Le mardi matin"

### Scenario: Le médiateur retire la description de son tag

* Given un médiateur qui possède le tag personnel "Ateliers"
* When ce médiateur renomme son tag en "Ateliers" sans description
* Then la modification du tag réussit
* And le tag n'a plus de description

## Rule: Personne ne modifie un tag qu'il ne gère pas

### Scenario: Un médiateur ne modifie pas le tag personnel d'un autre

* Given un médiateur qui possède le tag personnel "Ateliers"
* When un autre médiateur renomme ce tag en "Piraté"
* Then la modification du tag est refusée
* And le tag s'appelle toujours "Ateliers"
