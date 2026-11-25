# Fonctionnalité: Exposer les CRA v1

> L'API v1 expose les comptes rendus d'activité importés de l'ancien espace
> Conseiller numérique, du plus récent au plus ancien.

## Règle: L'API expose les CRA v1 importés

### Scénario: Un CRA v1 importé est exposé

* Étant donné un CRA v1 importé à exposer
* Quand l'API liste les CRA v1
* Alors ce CRA v1 est exposé

## Règle: Le curseur reprend la liste après le dernier CRA v1 lu

### Scénario: La page suivante commence après le curseur

* Étant donné deux CRA v1 importés à la suite à exposer
* Quand l'API liste les CRA v1 après le plus récent des deux
* Alors seul le plus ancien des deux ouvre la page
