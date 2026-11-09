# Feature: Détacher un compte de ses équipes

## Rule: Les invitations disparaissent, les appartenances deviennent d'anciennes appartenances

> Le coordinateur continue de voir le partant parmi ses anciens membres, et
> les activités de celui-ci restent comptées dans ses statistiques : effacer
> l'appartenance les en ferait disparaître.

### Scenario: Le médiateur quitte son équipe en ancien membre

* Given un médiateur coordonné par un seul coordinateur
* When je détache ce médiateur de ses équipes
* Then ce médiateur n'est plus membre actif d'aucune équipe
* And ce médiateur reste ancien membre de son équipe
* And les invitations de ce médiateur ont disparu
