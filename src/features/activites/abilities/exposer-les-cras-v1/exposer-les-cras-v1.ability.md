# Feature: Exposer les CRA v1

> L'API v1 expose les comptes rendus d'activité importés de l'ancien espace
> Conseiller numérique, du plus récent au plus ancien.

## Rule: L'API expose les CRA v1 importés

### Scenario: Un CRA v1 importé est exposé

* Given un CRA v1 importé à exposer
* When l'API liste les CRA v1
* Then ce CRA v1 est exposé

## Rule: Le curseur reprend la liste après le dernier CRA v1 lu

### Scenario: La page suivante commence après le curseur

* Given deux CRA v1 importés à la suite à exposer
* When l'API liste les CRA v1 après le plus récent des deux
* Then seul le plus ancien des deux ouvre la page
