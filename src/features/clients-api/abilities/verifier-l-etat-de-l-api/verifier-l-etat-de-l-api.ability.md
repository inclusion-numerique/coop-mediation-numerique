# Feature: Vérifier l'état de l'API

> Un partenaire vérifie que l'API v1 répond, sur la route `/health`. Tout
> client API valide peut l'appeler, quelles que soient ses permissions.

## Rule: L'état de l'API se lit avec un client API valide

### Scenario: Un appel sans client API est refusé

* When un appel sans client API vérifie l'état de l'API
* Then l'API refuse l'accès

### Scenario: Un client qui ne lit que les statistiques lit aussi l'état de l'API

* Given un client API "Supervision" avec les permissions "Statistiques"
* When le client API "Supervision" vérifie l'état de l'API
* Then l'API répond par l'état "ok"

## Rule: La route n'accepte aucun paramètre

### Scenario: Un paramètre est rejeté

* Given un client API "Supervision" avec les permissions "Activites"
* When le client API "Supervision" vérifie l'état de l'API avec "detail=1"
* Then l'API rejette la requête
