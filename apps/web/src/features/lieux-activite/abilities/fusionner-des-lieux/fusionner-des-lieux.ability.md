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

## Rule: Le lieu conservé n'est publié que si les deux l'étaient

> Publier parce que l'une des deux fiches l'était exposerait sur la carte
> nationale un endroit que son second dossier gardait volontairement à l'écart.
> La fusion peut donc dépublier ; elle ne publie jamais.

### Scenario: Deux fiches publiées donnent un lieu publié

* Given deux lieux à fusionner
* And les deux lieux sont publiés sur la carte nationale
* When l'administration fusionne le premier dans le second
* Then le lieu conservé est publié sur la carte nationale

### Scenario: Une seule fiche publiée donne un lieu retiré de la carte

* Given deux lieux à fusionner
* And seul le lieu conservé est publié sur la carte nationale
* When l'administration fusionne le premier dans le second
* Then le lieu conservé n'est pas publié sur la carte nationale

## Rule: Ce que la fiche absorbée est seule à renseigner lui survit

> La cible prime — c'est elle que l'administration garde — mais un contact
> qu'elle ne porte pas et que l'autre connaissait disparaîtrait sans retour.

### Scenario: Le référent de la fiche absorbée passe au lieu conservé

* Given deux lieux à fusionner
* And seule la fiche à absorber porte un référent
* When l'administration fusionne le premier dans le second
* Then le lieu conservé porte le référent de la fiche absorbée

### Scenario: Le référent du lieu conservé n'est pas écrasé

* Given deux lieux à fusionner
* And les deux fiches portent un référent différent
* When l'administration fusionne le premier dans le second
* Then le lieu conservé garde son propre référent
