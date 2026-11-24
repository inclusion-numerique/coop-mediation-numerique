# Feature: Lire les structures

> Un partenaire lit les structures de la coop par l'API v1, sur la route
> `/structures`, avec un client qui détient la permission « Structures ». La
> réponse suit JSON:API : une liste paginée par curseur. Ce qui est exposé de
> chaque structure est décrit par la spécification de l'inventaire des lieux.

## Rule: Seul un client qui détient la permission « Structures » lit les structures

### Scenario: Un appel sans client API doit s'authentifier

* When un appel sans client API lit les structures
* Then l'API demande de s'authentifier

### Scenario: Un client sans la permission est refusé

* Given un client API "Annuaire" avec les permissions "Activites"
* When le client API "Annuaire" lit les structures
* Then l'API refuse l'accès

### Scenario: Un client qui détient la permission lit une liste JSON:API

* Given un client API "Annuaire" avec les permissions "Structures"
* When le client API "Annuaire" lit les structures
* Then l'API répond par une liste JSON:API

## Rule: Le filtre par identifiants ne garde que les structures demandées

### Scenario: Un identifiant inconnu ne rend aucune structure

* Given un client API "Annuaire" avec les permissions "Structures"
* When le client API "Annuaire" lit les structures avec "ids=00000000-0000-4000-8000-000000000000"
* Then la page lue contient 0 élément
* And la page lue annonce un total de 0 élément

### Scenario: Un identifiant qui n'est pas un UUID est rejeté

* Given un client API "Annuaire" avec les permissions "Structures"
* When le client API "Annuaire" lit les structures avec "ids=pas-un-identifiant"
* Then l'API rejette la requête

## Rule: La taille de page est celle demandée, dans la limite de 500

### Scenario: La page a la taille demandée

* Given un client API "Annuaire" avec les permissions "Structures"
* When le client API "Annuaire" lit les structures avec "page[size]=1"
* Then la page lue annonce 1 élément par page

### Scenario: Une page de plus de 500 structures est rejetée

* Given un client API "Annuaire" avec les permissions "Structures"
* When le client API "Annuaire" lit les structures avec "page[size]=501"
* Then l'API rejette la requête
