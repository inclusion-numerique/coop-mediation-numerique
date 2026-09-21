# Feature: Auditer les données des lieux

> Ce que la base porte et que les règles n'acceptent plus.
>
> L'audit ne corrige rien : il confronte chaque valeur au modèle du standard qui
> la gouverne désormais, et rend de quoi décider. Une anomalie est donc, par
> construction, exactement ce que le code écarterait — ni plus, ni moins.

## Rule: Une valeur qu'un champ obligatoire refuse écarte le lieu

> Sans adresse valide, ce n'est pas une fiche diminuée : c'est une fiche qu'on
> ne sait plus désigner, et qu'on ne saurait pas atteindre sur une carte (D21).

### Scenario: Le lieu sans voie est signalé comme écarté

* Given un lieu dont la voie est vide
* When on audite les données des lieux
* Then le relevé compte ce lieu parmi les écartés
* And il porte le motif "voie-absente"

## Rule: Une valeur qu'un champ facultatif refuse se perd, le lieu reste

> Un horaire illisible ne doit pas faire disparaître un lieu de la carte : il y
> reste utile sans ses horaires, il n'existe plus du tout s'il est écarté.

### Scenario: Le lieu aux horaires illisibles reste, son horaire se perd

* Given un lieu dont les horaires ne suivent pas le format OpenStreetMap
* When on audite les données des lieux
* Then le relevé ne compte pas ce lieu parmi les écartés
* And il porte le motif "horaires-non-osm"
