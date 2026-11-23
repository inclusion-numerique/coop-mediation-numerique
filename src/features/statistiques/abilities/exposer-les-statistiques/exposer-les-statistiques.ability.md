# Feature: Exposer les statistiques

> L'API v1 expose les statistiques d'activité de la coop, restreintes par les
> mêmes filtres que la page « Mes statistiques ».

## Rule: Les totaux exposés sont ceux des statistiques fournies

### Scenario: Les totaux exposés comptent les activités fournies

* Given des statistiques fournies qui comptent 2 activités
* When l'API expose ces statistiques
* Then les statistiques comptent 2 activités

### Scenario: Une liste de types inconnus est refusée

* When l'API reçoit le filtre de types "individuel,inconnu"
* Then le filtre est refusé

### Scenario: Un statut de rendez-vous inconnu est refusé

* When l'API reçoit le filtre de statuts de rendez-vous "seen,inconnu"
* Then le filtre est refusé
