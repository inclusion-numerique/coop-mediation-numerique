# Feature: Authentifier un client API

> Un partenaire appelle l'API v1 avec l'identifiant de son client et son
> secret. L'appel passe si le secret est le bon, si le client est dans sa
> période de validité et s'il détient les permissions de la route appelée.

## Rule: Le bon secret, dans la période, avec les permissions, authentifie

### Scenario: Un client valide qui détient la permission est authentifié

* Given un client API "Tableau de bord" avec les permissions "Activites, Statistiques"
* When le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec son secret
* Then l'appel est authentifié

### Scenario: Un mauvais secret n'authentifie pas

* Given un client API "Tableau de bord" avec les permissions "Activites"
* When le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec un autre secret
* Then l'appel est refusé

### Scenario: Une permission manquante refuse l'appel

* Given un client API "Tableau de bord" avec les permissions "Activites"
* When le client API "Tableau de bord" appelle une route "Statistiques" le 26/10/2026 avec son secret
* Then l'appel est refusé

## Rule: Hors de sa période de validité, un client n'est pas authentifié

### Scenario: Un client pas encore valable est refusé

* Given un client API "Tableau de bord" valable du 01/11/2026 sans fin
* When le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec son secret
* Then l'appel est refusé

### Scenario: Un client dont la validité a pris fin est refusé

* Given un client API "Tableau de bord" valable du 01/01/2026 au 30/06/2026
* When le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec son secret
* Then l'appel est refusé
