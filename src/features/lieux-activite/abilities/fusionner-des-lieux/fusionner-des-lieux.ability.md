# Fonctionnalité: Fusionner deux lieux d'activité

> Deux fiches pour un même endroit, et l'administration tranche : l'une absorbe
> l'autre. La source disparaît définitivement — c'est un acte de modération, pas
> une correction de saisie.
>
> D'où la garde d'administration, posée par l'action plutôt que par l'ability :
> c'est l'écran qui est réservé, pas l'écriture. La recherche du lieu à absorber
> est réservée de même : elle voit tous les lieux de la coop, sans égard pour
> ceux où l'on exerce.

## Règle: La source disparaît dans la cible

### Scénario: Le lieu absorbé n'existe plus

* Étant donné deux lieux à fusionner
* Quand l'administration fusionne le premier dans le second
* Alors le lieu absorbé n'existe plus
* Et le lieu conservé existe toujours

### Scénario: Le médiateur de la source exerce dans la cible

* Étant donné deux lieux à fusionner
* Et un médiateur exerce dans le lieu à absorber
* Quand l'administration fusionne le premier dans le second
* Alors ce médiateur exerce dans le lieu conservé

### Scénario: Une fusion vers un lieu introuvable est refusée

* Étant donné deux lieux à fusionner
* Quand l'administration fusionne le premier dans un lieu introuvable
* Alors la fusion est refusée faute de lieu
* Et le lieu à absorber existe toujours

## Règle: On n'exerce pas deux fois dans le lieu conservé

> Le même médiateur peut exercer dans les deux fiches — c'est même le signe
> qu'elles désignent le même endroit. La fusion ne doit pas lui en faire deux.

### Scénario: Un médiateur rattaché aux deux n'y exerce qu'une fois

* Étant donné deux lieux à fusionner
* Et un médiateur exerce dans les deux lieux
* Quand l'administration fusionne le premier dans le second
* Alors ce médiateur n'exerce qu'une fois dans le lieu conservé

## Règle: Ce que les deux fiches déclarent s'additionne

> Aucune des deux ne dit toute la vérité sur l'endroit : ce que l'une sait et
> l'autre ignore doit survivre à la fusion.

### Scénario: Les services des deux lieux se retrouvent dans le lieu conservé

* Étant donné deux lieux à fusionner
* Quand l'administration fusionne le premier dans le second
* Alors le lieu conservé annonce les services des deux

## Règle: Le lieu conservé n'est publié que si les deux l'étaient

> Publier parce que l'une des deux fiches l'était exposerait sur la carte
> nationale un endroit que son second dossier gardait volontairement à l'écart.
> La fusion peut donc dépublier ; elle ne publie jamais.

### Scénario: Deux fiches publiées donnent un lieu publié

* Étant donné deux lieux à fusionner
* Et les deux lieux sont publiés sur la carte nationale
* Quand l'administration fusionne le premier dans le second
* Alors le lieu conservé est publié sur la carte nationale

### Scénario: Une seule fiche publiée donne un lieu retiré de la carte

* Étant donné deux lieux à fusionner
* Et seul le lieu conservé est publié sur la carte nationale
* Quand l'administration fusionne le premier dans le second
* Alors le lieu conservé n'est pas publié sur la carte nationale

## Règle: La fusion se répercute au registre de l'Entrepôt

> Le registre sert d'autres consommateurs que la coop. Y effacer purement et
> simplement le lieu absorbé ne leur dirait rien de ce qui lui est arrivé : son
> inscription reste, marquée supprimée. Le lieu conservé, lui, a récupéré les
> valeurs des deux fiches, et c'est cet état-là qui fait désormais foi : il se
> réécrit en entier.

### Scénario: L'inscription du lieu absorbé est marquée supprimée, pas effacée

* Étant donné deux lieux à fusionner
* Et les deux lieux sont inscrits au registre sous la source « dora »
* Quand l'administration fusionne le premier dans le second
* Alors l'inscription du lieu absorbé est datée supprimée

### Scénario: Un retrait ne change pas le producteur des valeurs restées en place

> `edited_by` dit qui a agi. `source` continue de nommer qui a produit ce que la
> ligne dit encore, et une suppression n'écrit aucune valeur.

* Étant donné deux lieux à fusionner
* Et les deux lieux sont inscrits au registre sous la source « dora »
* Quand l'administration fusionne le premier dans le second
* Alors l'inscription du lieu absorbé porte la coop comme dernier éditeur
* Et elle annonce toujours « dora » comme source

### Scénario: L'inscription du lieu conservé porte les valeurs des deux fiches

* Étant donné deux lieux à fusionner
* Et les deux lieux sont inscrits au registre sous la source « dora »
* Quand l'administration fusionne le premier dans le second
* Alors l'inscription du lieu conservé annonce les services des deux

### Scénario: Un lieu conservé que le registre ignorait y est inscrit

> La fusion est une modification comme une autre : elle inscrit le lieu qui
> reste, plutôt que de laisser au flux quotidien le soin de le découvrir.

* Étant donné deux lieux à fusionner
* Quand l'administration fusionne le premier dans le second
* Alors le lieu conservé est inscrit au registre

## Règle: Ce que la fiche absorbée est seule à renseigner lui survit

> La cible prime — c'est elle que l'administration garde — mais un contact
> qu'elle ne porte pas et que l'autre connaissait disparaîtrait sans retour.

### Scénario: Le référent de la fiche absorbée passe au lieu conservé

* Étant donné deux lieux à fusionner
* Et seule la fiche à absorber porte un référent
* Quand l'administration fusionne le premier dans le second
* Alors le lieu conservé porte le référent de la fiche absorbée

### Scénario: Le référent du lieu conservé n'est pas écrasé

* Étant donné deux lieux à fusionner
* Et les deux fiches portent un référent différent
* Quand l'administration fusionne le premier dans le second
* Alors le lieu conservé garde son propre référent
