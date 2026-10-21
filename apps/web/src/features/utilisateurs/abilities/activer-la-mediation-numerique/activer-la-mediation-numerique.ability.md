# Feature: Activer la médiation numérique

> Un coordinateur peut réaliser lui-même des accompagnements : il active
> alors les fonctionnalités de médiation numérique, qui ajoutent le rôle
> médiateur à son compte. Ce rôle ne se désactive pas ensuite.

## Rule: Un coordinateur active la médiation pour lui-même

### Scenario: Un coordinateur devient aussi médiateur

* Given un coordinateur sans médiation numérique
* When il active la médiation numérique
* Then l'activation de la médiation aboutit
* And son compte porte le rôle médiateur

### Scenario: Activer deux fois ne change rien

* Given un coordinateur qui a déjà activé la médiation numérique
* When il active la médiation numérique
* Then l'activation de la médiation aboutit
* And son compte porte un seul rôle médiateur

## Rule: Seul un coordinateur l'active

### Scenario: Un médiateur seul ne l'active pas

* Given un médiateur sans rôle coordinateur
* When il active la médiation numérique
* Then l'activation de la médiation échoue avec l'erreur "NonCoordinateur"
