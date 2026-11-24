# Feature: Lire les utilisateurs

> Un partenaire lit les utilisateurs de la coop par l'API v1, sur la route
> `/utilisateurs`, avec un client qui détient la permission « Utilisateurs ».
> La réponse suit JSON:API : une liste paginée par curseur. Ce qui est exposé
> de chaque utilisateur, et ce que font les filtres, est décrit par la
> spécification de l'exposition des utilisateurs.

## Rule: Seul un client qui détient la permission « Utilisateurs » lit les utilisateurs

### Scenario: Un appel sans client API est refusé

* When un appel sans client API lit les utilisateurs
* Then l'API refuse l'accès

### Scenario: Un client sans la permission est refusé

* Given un client API "Annuaire" avec les permissions "Structures"
* When le client API "Annuaire" lit les utilisateurs
* Then l'API refuse l'accès

### Scenario: Un client qui détient la permission lit une liste JSON:API

* Given un client API "Annuaire" avec les permissions "Utilisateurs"
* When le client API "Annuaire" lit les utilisateurs
* Then l'API répond par une liste JSON:API

## Rule: Les filtres n'acceptent que les valeurs documentées

### Scenario: Un filtre conseiller numérique autre que 0 ou 1 est rejeté

* Given un client API "Annuaire" avec les permissions "Utilisateurs"
* When le client API "Annuaire" lit les utilisateurs avec "filter[conseiller_numerique]=oui"
* Then l'API rejette la requête

### Scenario: Un filtre de suppression autre que 0 ou 1 est rejeté

* Given un client API "Annuaire" avec les permissions "Utilisateurs"
* When le client API "Annuaire" lit les utilisateurs avec "filter[soft_deleted]=oui"
* Then l'API rejette la requête

## Rule: La taille de page est celle demandée, dans la limite de 500

### Scenario: La page a la taille demandée

* Given un client API "Annuaire" avec les permissions "Utilisateurs"
* When le client API "Annuaire" lit les utilisateurs avec "page[size]=1"
* Then la page lue annonce 1 élément par page

### Scenario: Une page de plus de 500 utilisateurs est rejetée

* Given un client API "Annuaire" avec les permissions "Utilisateurs"
* When le client API "Annuaire" lit les utilisateurs avec "page[size]=501"
* Then l'API rejette la requête
