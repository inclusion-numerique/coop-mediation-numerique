# Fonctionnalité: Exporter les accompagnements par département

> L'administration exporte, pour le pilotage, le nombre d'accompagnements
> réalisés dans chaque département, séparément pour les conseillers numériques
> et pour les autres médiateurs.

## Règle: Un accompagnement compte dans le département de son lieu

### Scénario: L'accompagnement d'un médiateur compte dans son département

* Étant donné le décompte des accompagnements de médiateurs en Corse-du-Sud
* Et un accompagnement réalisé par un médiateur à Ajaccio le 1er octobre 2026
* Quand l'administration exporte les accompagnements
* Alors la Corse-du-Sud compte 1 accompagnement de médiateur de plus

## Règle: L'export s'arrête à la date demandée

### Scénario: Un accompagnement postérieur à la date demandée n'est pas compté

* Étant donné le décompte des accompagnements de médiateurs en Corse-du-Sud jusqu'au 30 septembre 2026
* Et un accompagnement réalisé par un médiateur à Ajaccio le 1er octobre 2026
* Quand l'administration exporte les accompagnements jusqu'au 30 septembre 2026
* Alors la Corse-du-Sud compte 0 accompagnement de médiateur de plus
