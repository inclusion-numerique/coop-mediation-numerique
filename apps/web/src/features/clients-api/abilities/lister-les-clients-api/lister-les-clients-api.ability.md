# Feature: Lister les clients API

> L'administration retrouve tous les clients API, du plus récent au plus
> ancien.

## Rule: Les clients API se listent du plus récent au plus ancien

### Scenario: Le dernier client créé ouvre la liste

* Given un client API "Tableau de bord"
* And un client API "Observatoire"
* When l'administration liste les clients API
* Then "Observatoire" précède "Tableau de bord" dans la liste
