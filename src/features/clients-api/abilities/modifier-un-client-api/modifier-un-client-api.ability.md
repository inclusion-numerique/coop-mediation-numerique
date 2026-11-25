# Fonctionnalité: Modifier un client API

> L'administration ajuste les permissions et la période de validité d'un
> client API. Fixer une fin de validité passée coupe son accès.

## Règle: Les permissions et la période d'un client API se modifient

### Scénario: L'administration change les permissions et la fin de validité

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Quand l'administration modifie le client API "Tableau de bord" avec les permissions "Statistiques" du 01/01/2026 au 31/12/2026
* Alors le client API "Tableau de bord" a les permissions "Statistiques"

## Règle: Un client API ne peut pas prendre le nom d'un autre

### Scénario: Le nom d'un autre client est refusé

* Étant donné un client API "Tableau de bord"
* Et un client API "Observatoire"
* Quand l'administration renomme le client API "Observatoire" en "Tableau de bord"
* Alors la modification échoue car le nom est déjà pris

## Règle: Un client API inconnu ne se modifie pas

### Scénario: Modifier un client inexistant échoue

* Quand l'administration modifie un client API qui n'existe pas
* Alors la modification échoue car le client API est introuvable
