# Fonctionnalité: Activer la médiation numérique

> Un coordinateur peut réaliser lui-même des accompagnements : il active
> alors les fonctionnalités de médiation numérique, qui ajoutent le rôle
> médiateur à son compte. Ce rôle ne se désactive pas ensuite.

## Règle: Un coordinateur active la médiation pour lui-même

### Scénario: Un coordinateur devient aussi médiateur

* Étant donné un coordinateur sans médiation numérique
* Quand il active la médiation numérique
* Alors l'activation de la médiation aboutit
* Et son compte porte le rôle médiateur

### Scénario: Activer deux fois ne change rien

* Étant donné un coordinateur qui a déjà activé la médiation numérique
* Quand il active la médiation numérique
* Alors l'activation de la médiation aboutit
* Et son compte porte un seul rôle médiateur

## Règle: Seul un coordinateur l'active

### Scénario: Un médiateur seul ne l'active pas

* Étant donné un médiateur sans rôle coordinateur
* Quand il active la médiation numérique
* Alors l'activation de la médiation échoue avec l'erreur "NonCoordinateur"
