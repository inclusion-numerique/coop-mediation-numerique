# Fonctionnalité: Mesurer la visibilité sur la cartographie

> La fiche « Cartographie nationale » de Mes outils dit au médiateur combien de
> ses lieux sont visibles sur la carte, et combien de lieux son département y
> présente.

## Règle: Seuls les lieux déclarés visibles comptent parmi les lieux visibles du médiateur

> « Visible » est la déclaration portée par le lieu, pas le résultat du
> moissonnage : la publication exige en plus qu'un médiateur visible y exerce.
> Un médiateur qui a masqué son profil voit donc ses lieux comptés ici sans
> qu'ils paraissent sur la carte. L'écart est connu ; le corriger changerait
> ce que la page annonce.

### Scénario: Le lieu visible où il exerce compte

* Étant donné un médiateur qui exerce dans un lieu visible de Charente-Maritime
* Quand on mesure sa visibilité sur la cartographie
* Alors 1 de ses lieux est visible
* Et son département de référence est la Charente-Maritime

### Scénario: Le lieu non visible où il exerce ne compte pas

* Étant donné un médiateur qui exerce dans un lieu non visible de Charente-Maritime
* Quand on mesure sa visibilité sur la cartographie
* Alors 0 de ses lieux est visible

## Règle: Le département compte ses lieux visibles

### Scénario: Un nouveau lieu visible du département s'ajoute au décompte

* Étant donné un médiateur qui exerce dans un lieu non visible de Charente-Maritime
* Et sa visibilité sur la cartographie mesurée
* Et un nouveau lieu visible en Charente-Maritime
* Quand on mesure sa visibilité sur la cartographie
* Alors son département compte 1 lieu de plus
