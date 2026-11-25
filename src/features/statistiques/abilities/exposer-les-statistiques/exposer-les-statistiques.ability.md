# Fonctionnalité: Exposer les statistiques

> L'API v1 expose les statistiques d'activité de la coop, restreintes par les
> mêmes filtres que la page « Mes statistiques ».

## Règle: Les totaux exposés sont ceux des statistiques fournies

### Scénario: Les totaux exposés comptent les activités fournies

* Étant donné des statistiques fournies qui comptent 2 activités
* Quand l'API expose ces statistiques
* Alors les statistiques comptent 2 activités

### Scénario: Une liste de types inconnus est refusée

* Quand l'API reçoit le filtre de types "individuel,inconnu"
* Alors le filtre est refusé

### Scénario: Un statut de rendez-vous inconnu est refusé

* Quand l'API reçoit le filtre de statuts de rendez-vous "seen,inconnu"
* Alors le filtre est refusé
