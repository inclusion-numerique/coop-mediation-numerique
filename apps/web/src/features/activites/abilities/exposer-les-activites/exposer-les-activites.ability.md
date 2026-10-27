# Feature: Exposer les activités

> L'API v1 expose les activités des médiateurs, de la plus récemment modifiée
> à la plus ancienne.

## Rule: L'API filtre les activités sur leur date de modification

### Scenario: Une activité modifiée depuis la date demandée est exposée

* Given des activités à exposer
* When l'API liste les activités modifiées depuis leur saisie
* Then ces activités sont exposées

### Scenario: Une activité modifiée avant la date demandée est écartée

* Given des activités à exposer
* When l'API liste les activités modifiées depuis demain
* Then aucune de ces activités n'est exposée

## Rule: Le curseur reprend la liste après la dernière activité lue

### Scenario: La page suivante commence après le curseur

* Given des activités à exposer
* When l'API liste une activité par page depuis leur saisie
* Then la page suivante expose l'autre activité
