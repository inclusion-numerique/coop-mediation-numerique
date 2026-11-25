# Fonctionnalité: Lire les structures

> Un partenaire lit les structures de la coop par l'API v1, sur la route
> `/structures`, avec un client qui détient la permission « Structures ». La
> réponse suit JSON:API : une liste paginée par curseur. Ce qui est exposé de
> chaque structure est décrit par la spécification de l'inventaire des lieux.

## Règle: Seul un client qui détient la permission « Structures » lit les structures

### Scénario: Un appel sans client API doit s'authentifier

* Quand un appel sans client API lit les structures
* Alors l'API demande de s'authentifier

### Scénario: Un client sans la permission est refusé

* Étant donné un client API "Annuaire" avec les permissions "Activites"
* Quand le client API "Annuaire" lit les structures
* Alors l'API refuse l'accès

### Scénario: Un client qui détient la permission lit une liste JSON:API

* Étant donné un client API "Annuaire" avec les permissions "Structures"
* Quand le client API "Annuaire" lit les structures
* Alors l'API répond par une liste JSON:API

## Règle: Le filtre par identifiants ne garde que les structures demandées

### Scénario: Un identifiant inconnu ne rend aucune structure

* Étant donné un client API "Annuaire" avec les permissions "Structures"
* Quand le client API "Annuaire" lit les structures avec "ids=00000000-0000-4000-8000-000000000000"
* Alors la page lue contient 0 élément
* Et la page lue annonce un total de 0 élément

### Scénario: Un identifiant qui n'est pas un UUID est rejeté

* Étant donné un client API "Annuaire" avec les permissions "Structures"
* Quand le client API "Annuaire" lit les structures avec "ids=pas-un-identifiant"
* Alors l'API rejette la requête

## Règle: La taille de page est celle demandée, dans la limite de 500

### Scénario: La page a la taille demandée

* Étant donné un client API "Annuaire" avec les permissions "Structures"
* Quand le client API "Annuaire" lit les structures avec "page[size]=1"
* Alors la page lue annonce 1 élément par page

### Scénario: Une page de plus de 500 structures est rejetée

* Étant donné un client API "Annuaire" avec les permissions "Structures"
* Quand le client API "Annuaire" lit les structures avec "page[size]=501"
* Alors l'API rejette la requête
