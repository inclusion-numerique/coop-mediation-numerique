# Feature: Fusionner deux lieux d'activité

> Deux fiches pour un même endroit, et l'administration tranche : l'une absorbe
> l'autre. La source disparaît définitivement — c'est un acte de modération, pas
> une correction de saisie.

## Rule: La source disparaît dans la cible

### Scenario: Le lieu absorbé n'existe plus

* Given deux lieux à fusionner
* When l'administration fusionne le premier dans le second
* Then le lieu absorbé n'existe plus
* And le lieu conservé existe toujours

### Scenario: Le médiateur de la source exerce dans la cible

* Given deux lieux à fusionner
* And un médiateur exerce dans le lieu à absorber
* When l'administration fusionne le premier dans le second
* Then ce médiateur exerce dans le lieu conservé

## Rule: On n'exerce pas deux fois dans le lieu conservé

> Le même médiateur peut exercer dans les deux fiches — c'est même le signe
> qu'elles désignent le même endroit. La fusion ne doit pas lui en faire deux.

### Scenario: Un médiateur rattaché aux deux n'y exerce qu'une fois

* Given deux lieux à fusionner
* And un médiateur exerce dans les deux lieux
* When l'administration fusionne le premier dans le second
* Then ce médiateur n'exerce qu'une fois dans le lieu conservé

## Rule: Ce que les deux fiches déclarent s'additionne

> Aucune des deux ne dit toute la vérité sur l'endroit : ce que l'une sait et
> l'autre ignore doit survivre à la fusion.

### Scenario: Les services des deux lieux se retrouvent dans le lieu conservé

* Given deux lieux à fusionner
* When l'administration fusionne le premier dans le second
* Then le lieu conservé annonce les services des deux
