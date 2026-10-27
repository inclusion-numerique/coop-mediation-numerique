# Feature: Lister mes outils

> La page « Mes outils » présente les outils utiles à la pratique de la
> médiation numérique. Certains ne concernent qu'un public : les coordinateurs,
> ou le dispositif Conseiller numérique.

## Rule: Les outils communs sont proposés à tous

### Scenario: Le médiateur hors dispositif voit les outils communs

* Given un médiateur hors dispositif
* When il consulte ses outils
* Then il voit Aidants Connect, la cartographie nationale, Les Bases et Mattermost
* And il ne voit pas le centre d'aide du dispositif

## Rule: Le dispositif Conseiller numérique ouvre ses propres outils

### Scenario: Le conseiller numérique voit sa base de contributions et le centre d'aide

* Given un médiateur du dispositif Conseiller numérique
* When il consulte ses outils
* Then il voit la base des contributions et le centre d'aide du dispositif
* And il ne voit pas la base des coordinateurs

## Rule: Les coordinateurs du dispositif voient la base des coordinateurs

### Scenario: Le coordinateur du dispositif voit tous les outils

* Given un coordinateur du dispositif Conseiller numérique
* When il consulte ses outils
* Then il voit Mon Inclusion Numérique et la base des coordinateurs
