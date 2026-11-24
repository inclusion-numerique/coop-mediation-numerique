# Feature: Lire les statistiques

> Un partenaire lit les statistiques nationales d'activité de la coop par l'API
> v1, sur la route `/statistiques`, avec un client qui détient la permission
> « Statistiques ». La réponse suit JSON:API : une ressource unique de type
> « statistiques ». Les filtres sont ceux de la page « Mes statistiques » ; ce
> qu'ils retiennent, et ce que valent les totaux, est décrit par la
> spécification de l'exposition des statistiques.

## Rule: Seul un client qui détient la permission « Statistiques » lit les statistiques

### Scenario: Un appel sans client API doit s'authentifier

* When un appel sans client API lit les statistiques
* Then l'API demande de s'authentifier

### Scenario: Un client sans la permission est refusé

* Given un client API "Observatoire" avec les permissions "Activites"
* When le client API "Observatoire" lit les statistiques
* Then l'API refuse l'accès

### Scenario: Un client qui détient la permission lit la ressource des statistiques

* Given un client API "Observatoire" avec les permissions "Statistiques"
* When le client API "Observatoire" lit les statistiques avec "filter[du]=2099-01-01&filter[au]=2099-01-31"
* Then l'API répond par la ressource JSON:API "statistiques"

## Rule: Les filtres sont validés

### Scenario: Une date qui n'est pas un jour est rejetée

* Given un client API "Observatoire" avec les permissions "Statistiques"
* When le client API "Observatoire" lit les statistiques avec "filter[du]=hier"
* Then l'API rejette la requête

### Scenario: Un type d'activité inconnu est rejeté

* Given un client API "Observatoire" avec les permissions "Statistiques"
* When le client API "Observatoire" lit les statistiques avec "filter[types]=individuel,inconnu"
* Then l'API rejette la requête

### Scenario: Un paramètre hors des filtres est rejeté

* Given un client API "Observatoire" avec les permissions "Statistiques"
* When le client API "Observatoire" lit les statistiques avec "periode=2099"
* Then l'API rejette la requête
