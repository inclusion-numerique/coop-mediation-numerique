# Fonctionnalité: Authentifier un client API

> Un partenaire appelle l'API v1 avec l'identifiant de son client et son
> secret. Il est authentifié si le secret est le bon et si le client est dans
> sa période de validité ; il est autorisé s'il détient en plus les
> permissions de la route appelée.

## Règle: Le bon secret, dans la période, authentifie ; les permissions autorisent

### Scénario: Un client valide qui détient la permission est authentifié

* Étant donné un client API "Tableau de bord" avec les permissions "Activites, Statistiques"
* Quand le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec son secret
* Alors l'appel est authentifié

### Scénario: Un mauvais secret n'authentifie pas

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Quand le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec un autre secret
* Alors l'appel n'est pas authentifié

### Scénario: Une permission manquante laisse le client authentifié mais non autorisé

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Quand le client API "Tableau de bord" appelle une route "Statistiques" le 26/10/2026 avec son secret
* Alors l'appel est authentifié sans la permission

## Règle: Hors de sa période de validité, un client n'est pas authentifié

### Scénario: Un client pas encore valable est refusé

* Étant donné un client API "Tableau de bord" valable du 01/11/2026 sans fin
* Quand le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec son secret
* Alors l'appel n'est pas authentifié

### Scénario: Un client dont la validité a pris fin est refusé

* Étant donné un client API "Tableau de bord" valable du 01/01/2026 au 30/06/2026
* Quand le client API "Tableau de bord" appelle une route "Activites" le 26/10/2026 avec son secret
* Alors l'appel n'est pas authentifié
