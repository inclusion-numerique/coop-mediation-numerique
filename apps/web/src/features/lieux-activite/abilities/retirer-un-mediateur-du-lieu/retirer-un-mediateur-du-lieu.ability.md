# Feature: Retirer un médiateur d'un lieu d'activité

## Rule: Le retrait date la fin de l'exercice, il n'efface pas le passage

> Le rattachement reste, avec sa date de fin : c'est ce qui permet de savoir
> qu'une personne a exercé là. Seul l'effacement d'un compte fait disparaître
> la ligne.

### Scenario: Le médiateur se retire lui-même d'un lieu

* Given un médiateur qui exerce dans un lieu
* When ce médiateur se retire lui-même du lieu
* Then le rattachement porte une date de fin
* And le rattachement n’est pas supprimé
* And ce médiateur n’exerce plus dans ce lieu

## Rule: Retirer quelqu'un d'autre suppose d'en avoir le titre

> Corriger la fiche d'un lieu est ouvert à tous ; retirer autrui de son lieu
> d'exercice ne l'est pas.

### Scenario: Un coordinateur retire un médiateur

* Given un médiateur qui exerce dans un lieu
* When un coordinateur retire ce médiateur du lieu
* Then ce médiateur n’exerce plus dans ce lieu

### Scenario: Un médiateur tiers ne peut pas en retirer un autre

* Given un médiateur qui exerce dans un lieu
* When un médiateur étranger tente de retirer ce médiateur du lieu
* Then le retrait est refusé
* And ce médiateur exerce toujours dans ce lieu

## Rule: On ne retire pas deux fois

### Scenario: Le second retrait ne trouve plus de rattachement actif

* Given un médiateur qui exerce dans un lieu
* When ce médiateur se retire lui-même du lieu
* And ce médiateur se retire à nouveau du lieu
* Then le retrait est refusé
