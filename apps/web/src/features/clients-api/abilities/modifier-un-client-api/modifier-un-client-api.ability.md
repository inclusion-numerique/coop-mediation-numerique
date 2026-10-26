# Feature: Modifier un client API

> L'administration ajuste les permissions et la période de validité d'un
> client API. Fixer une fin de validité passée coupe son accès.

## Rule: Les permissions et la période d'un client API se modifient

### Scenario: L'administration change les permissions et la fin de validité

* Given un client API "Tableau de bord" avec les permissions "Activites"
* When l'administration modifie le client API "Tableau de bord" avec les permissions "Statistiques" du 01/01/2026 au 31/12/2026
* Then le client API "Tableau de bord" a les permissions "Statistiques"

## Rule: Un client API ne peut pas prendre le nom d'un autre

### Scenario: Le nom d'un autre client est refusé

* Given un client API "Tableau de bord"
* And un client API "Observatoire"
* When l'administration renomme le client API "Observatoire" en "Tableau de bord"
* Then la modification échoue car le nom est déjà pris

## Rule: Un client API inconnu ne se modifie pas

### Scenario: Modifier un client inexistant échoue

* When l'administration modifie un client API qui n'existe pas
* Then la modification échoue car le client API est introuvable
