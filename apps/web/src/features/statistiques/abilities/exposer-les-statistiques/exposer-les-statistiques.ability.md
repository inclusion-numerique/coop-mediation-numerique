# Feature: Exposer les statistiques

> L'API v1 expose les statistiques d'activité de la coop, restreintes par les
> mêmes filtres que la page « Mes statistiques ».

## Rule: Les totaux portent sur les activités filtrées

### Scenario: Les totaux d'un médiateur comptent ses activités

* Given des activités à compter dans les statistiques
* When l'API calcule les statistiques de leur médiateur
* Then les statistiques comptent 2 activités

### Scenario: Une liste de types inconnus est refusée

* When l'API reçoit le filtre de types "individuel,inconnu"
* Then le filtre est refusé
