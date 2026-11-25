# Fonctionnalité: Lire les statistiques

> Un partenaire lit les statistiques nationales d'activité de la coop par l'API
> v1, sur la route `/statistiques`, avec un client qui détient la permission
> « Statistiques ». La réponse suit JSON:API : une ressource unique de type
> « statistiques ». Les filtres sont ceux de la page « Mes statistiques » ; ce
> qu'ils retiennent, et ce que valent les totaux, est décrit par la
> spécification de l'exposition des statistiques.

## Règle: Seul un client qui détient la permission « Statistiques » lit les statistiques

### Scénario: Un appel sans client API doit s'authentifier

* Quand un appel sans client API lit les statistiques
* Alors l'API demande de s'authentifier

### Scénario: Un client sans la permission est refusé

* Étant donné un client API "Observatoire" avec les permissions "Activites"
* Quand le client API "Observatoire" lit les statistiques
* Alors l'API refuse l'accès

### Scénario: Un client qui détient la permission lit la ressource des statistiques

* Étant donné un client API "Observatoire" avec les permissions "Statistiques"
* Quand le client API "Observatoire" lit les statistiques avec "filter[du]=2099-01-01&filter[au]=2099-01-31"
* Alors l'API répond par la ressource JSON:API "statistiques"

## Règle: Les filtres sont validés

### Scénario: Une date qui n'est pas un jour est rejetée

* Étant donné un client API "Observatoire" avec les permissions "Statistiques"
* Quand le client API "Observatoire" lit les statistiques avec "filter[du]=hier"
* Alors l'API rejette la requête

### Scénario: Un type d'activité inconnu est rejeté

* Étant donné un client API "Observatoire" avec les permissions "Statistiques"
* Quand le client API "Observatoire" lit les statistiques avec "filter[types]=individuel,inconnu"
* Alors l'API rejette la requête

### Scénario: Un paramètre hors des filtres est rejeté

* Étant donné un client API "Observatoire" avec les permissions "Statistiques"
* Quand le client API "Observatoire" lit les statistiques avec "periode=2099"
* Alors l'API rejette la requête
