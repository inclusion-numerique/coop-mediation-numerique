# Feature: Importer des bénéficiaires

## Rule: Les bénéficiaires importés sont créés pour le médiateur courant

### Scenario: Importer plusieurs bénéficiaires

* When j'importe 2 bénéficiaires
* Then l'import crée 2 bénéficiaires
* And le compteur de bénéficiaires du médiateur est incrémenté de 2
