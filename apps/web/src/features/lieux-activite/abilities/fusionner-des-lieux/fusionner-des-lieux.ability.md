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

## Rule: La fusion se répercute au registre de l'Entrepôt

> Le registre sert d'autres consommateurs que la coop. Y effacer purement et
> simplement le lieu absorbé ne leur dirait rien de ce qui lui est arrivé : son
> inscription reste, marquée supprimée. Le lieu conservé, lui, a récupéré les
> valeurs des deux fiches, et c'est cet état-là qui fait désormais foi : il se
> réécrit en entier.

### Scenario: L'inscription du lieu absorbé est marquée supprimée, pas effacée

* Given deux lieux à fusionner
* And les deux lieux sont inscrits au registre sous la source « dora »
* When l'administration fusionne le premier dans le second
* Then l'inscription du lieu absorbé est datée supprimée

### Scenario: Un retrait ne change pas le producteur des valeurs restées en place

> `edited_by` dit qui a agi. `source` continue de nommer qui a produit ce que la
> ligne dit encore, et une suppression n'écrit aucune valeur.

* Given deux lieux à fusionner
* And les deux lieux sont inscrits au registre sous la source « dora »
* When l'administration fusionne le premier dans le second
* Then l'inscription du lieu absorbé porte la coop comme dernier éditeur
* And elle annonce toujours « dora » comme source

### Scenario: L'inscription du lieu conservé porte les valeurs des deux fiches

* Given deux lieux à fusionner
* And les deux lieux sont inscrits au registre sous la source « dora »
* When l'administration fusionne le premier dans le second
* Then l'inscription du lieu conservé annonce les services des deux

### Scenario: Un lieu conservé que le registre ignorait y est inscrit

> La fusion est une modification comme une autre : elle inscrit le lieu qui
> reste, plutôt que de laisser au flux quotidien le soin de le découvrir.

* Given deux lieux à fusionner
* When l'administration fusionne le premier dans le second
* Then le lieu conservé est inscrit au registre

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
