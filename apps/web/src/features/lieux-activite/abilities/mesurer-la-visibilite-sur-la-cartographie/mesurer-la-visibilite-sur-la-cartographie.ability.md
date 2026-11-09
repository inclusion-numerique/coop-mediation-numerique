# Feature: Mesurer la visibilité sur la cartographie

> La fiche « Cartographie nationale » de Mes outils dit au médiateur combien de
> ses lieux sont visibles sur la carte, et combien de lieux son département y
> présente.

## Rule: Seuls les lieux déclarés visibles comptent parmi les lieux visibles du médiateur

> « Visible » est la déclaration portée par le lieu, pas le résultat du
> moissonnage : la publication exige en plus qu'un médiateur visible y exerce.
> Un médiateur qui a masqué son profil voit donc ses lieux comptés ici sans
> qu'ils paraissent sur la carte. L'écart est connu ; le corriger changerait
> ce que la page annonce.

### Scenario: Le lieu visible où il exerce compte

* Given un médiateur qui exerce dans un lieu visible de Charente-Maritime
* When on mesure sa visibilité sur la cartographie
* Then 1 de ses lieux est visible
* And son département de référence est la Charente-Maritime

### Scenario: Le lieu non visible où il exerce ne compte pas

* Given un médiateur qui exerce dans un lieu non visible de Charente-Maritime
* When on mesure sa visibilité sur la cartographie
* Then 0 de ses lieux est visible

## Rule: Le département compte ses lieux visibles

### Scenario: Un nouveau lieu visible du département s'ajoute au décompte

* Given un médiateur qui exerce dans un lieu non visible de Charente-Maritime
* And sa visibilité sur la cartographie mesurée
* And un nouveau lieu visible en Charente-Maritime
* When on mesure sa visibilité sur la cartographie
* Then son département compte 1 lieu de plus
