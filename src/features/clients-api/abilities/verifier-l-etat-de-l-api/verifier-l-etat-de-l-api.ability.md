# Fonctionnalité: Vérifier l'état de l'API

> Un partenaire vérifie que l'API v1 répond, sur la route `/health`. Tout
> client API valide peut l'appeler, quelles que soient ses permissions.

## Règle: L'état de l'API se lit avec un client API valide

### Scénario: Un appel sans client API doit s'authentifier

* Quand un appel sans client API vérifie l'état de l'API
* Alors l'API demande de s'authentifier

### Scénario: Un client qui ne lit que les statistiques lit aussi l'état de l'API

* Étant donné un client API "Supervision" avec les permissions "Statistiques"
* Quand le client API "Supervision" vérifie l'état de l'API
* Alors l'API répond par l'état "ok"

## Règle: La route n'accepte aucun paramètre

### Scénario: Un paramètre est rejeté

* Étant donné un client API "Supervision" avec les permissions "Activites"
* Quand le client API "Supervision" vérifie l'état de l'API avec "detail=1"
* Alors l'API rejette la requête
