# Feature: Exporter les accompagnements par département

> L'administration exporte, pour le pilotage, le nombre d'accompagnements
> réalisés dans chaque département, séparément pour les conseillers numériques
> et pour les autres médiateurs.

## Rule: Un accompagnement compte dans le département de son lieu

### Scenario: L'accompagnement d'un médiateur compte dans son département

* Given le décompte des accompagnements de médiateurs en Corse-du-Sud
* And un accompagnement réalisé par un médiateur à Ajaccio le 1er octobre 2026
* When l'administration exporte les accompagnements
* Then la Corse-du-Sud compte 1 accompagnement de médiateur de plus

## Rule: L'export s'arrête à la date demandée

### Scenario: Un accompagnement postérieur à la date demandée n'est pas compté

* Given le décompte des accompagnements de médiateurs en Corse-du-Sud jusqu'au 30 septembre 2026
* And un accompagnement réalisé par un médiateur à Ajaccio le 1er octobre 2026
* When l'administration exporte les accompagnements jusqu'au 30 septembre 2026
* Then la Corse-du-Sud compte 0 accompagnement de médiateur de plus
