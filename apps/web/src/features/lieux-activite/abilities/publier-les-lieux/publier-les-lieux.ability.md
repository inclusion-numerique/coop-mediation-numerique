# Feature: Publier les lieux sur la cartographie nationale

> Ce que la coop verse au bien commun. Trois conditions se cumulent, et
> l'absence d'une seule retire le lieu de la moisson.

## Rule: Un lieu ne se publie que s'il est déclaré visible

### Scenario: Le lieu non partagé reste hors de la cartographie

* Given un lieu où exerce un médiateur visible
* And ce lieu n'est pas partagé sur la cartographie
* When la cartographie nationale moissonne les lieux
* Then ce lieu n'est pas publié

## Rule: Un lieu où plus personne n'exerce n'est pas un lieu d'accueil

> La cartographie oriente des usagers vers quelqu'un. Un lieu que plus personne
> ne fait vivre les enverrait devant une porte close.

### Scenario: Le lieu dont le médiateur s'est retiré n'est plus publié

* Given un lieu partagé où exerce un médiateur visible
* And ce médiateur s'est retiré du lieu
* When la cartographie nationale moissonne les lieux
* Then ce lieu n'est pas publié

## Rule: Se rendre invisible retire son nom, pas le lieu

> Le réglage porte sur le PROFIL — nom, courriel, téléphone —, pas sur le lieu
> d'exercice. Une personne qui ne veut pas être nommée sur la carte n'en retire
> pas pour autant l'adresse où le public est reçu ; c'est la visibilité du lieu,
> et elle seule, qui décide de sa présence.

### Scenario: Le médiateur caché disparaît de la fiche, pas de la carte

* Given un lieu partagé où exerce un médiateur visible
* And ce médiateur a choisi de ne pas être visible
* When la cartographie nationale moissonne les lieux
* Then ce lieu est publié
* And il n'annonce aucun aidant

## Rule: Le lieu publié annonce qui y accueille

### Scenario: Le médiateur visible accompagne le lieu publié

* Given un lieu partagé où exerce un médiateur visible
* When la cartographie nationale moissonne les lieux
* Then ce lieu est publié
* And il annonce un aidant
