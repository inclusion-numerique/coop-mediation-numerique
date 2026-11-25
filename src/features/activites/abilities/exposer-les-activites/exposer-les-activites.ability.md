# Fonctionnalité: Exposer les activités

> L'API v1 expose les activités des médiateurs, de la plus récemment modifiée
> à la plus ancienne.

## Règle: L'API filtre les activités sur leur date de modification

### Scénario: Une activité modifiée depuis la date demandée est exposée

* Étant donné des activités à exposer
* Quand l'API liste les activités modifiées depuis leur saisie
* Alors ces activités sont exposées

### Scénario: Une activité modifiée avant la date demandée est écartée

* Étant donné des activités à exposer
* Quand l'API liste les activités modifiées depuis demain
* Alors aucune de ces activités n'est exposée

## Règle: Le curseur reprend la liste après la dernière activité lue

### Scénario: La page suivante commence après le curseur

* Étant donné des activités à exposer
* Quand l'API liste une activité par page depuis leur saisie
* Alors la page suivante expose l'autre activité
