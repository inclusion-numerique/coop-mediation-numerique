# Fonctionnalité: Retirer un médiateur d'un lieu d'activité

## Règle: Le retrait date la fin de l'exercice, il n'efface pas le passage

> Le rattachement reste, avec sa date de fin : c'est ce qui permet de savoir
> qu'une personne a exercé là. Seul l'effacement d'un compte fait disparaître
> la ligne.

### Scénario: Le médiateur se retire lui-même d'un lieu

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur se retire lui-même du lieu
* Alors le rattachement porte une date de fin
* Et le rattachement n’est pas supprimé
* Et ce médiateur n’exerce plus dans ce lieu

## Règle: Retirer quelqu'un d'autre suppose d'en avoir le titre

> Corriger la fiche d'un lieu est ouvert à tous ; retirer autrui de son lieu
> d'exercice ne l'est pas.

### Scénario: Le coordinateur de son équipe retire un médiateur

* Étant donné un médiateur qui exerce dans un lieu
* Quand le coordinateur de son équipe retire ce médiateur du lieu
* Alors ce médiateur n’exerce plus dans ce lieu

### Scénario: Le coordinateur d’une autre équipe ne peut pas retirer un médiateur

* Étant donné un médiateur qui exerce dans un lieu
* Quand le coordinateur d’une autre équipe tente de retirer ce médiateur du lieu
* Alors le retrait est refusé
* Et ce médiateur exerce toujours dans ce lieu

### Scénario: Un médiateur tiers ne peut pas en retirer un autre

* Étant donné un médiateur qui exerce dans un lieu
* Quand un médiateur étranger tente de retirer ce médiateur du lieu
* Alors le retrait est refusé
* Et ce médiateur exerce toujours dans ce lieu

## Règle: On ne retire pas deux fois

### Scénario: Le second retrait ne trouve plus de rattachement actif

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur se retire lui-même du lieu
* Et ce médiateur se retire à nouveau du lieu
* Alors le retrait est refusé
