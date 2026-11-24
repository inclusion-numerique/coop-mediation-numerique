# Feature: Lire les CRA v1

> Un partenaire lit les comptes rendus d'activité importés de la première
> version de la coop par l'API v1, sur la route `/archives-v1/cras`, avec un
> client qui détient la permission « Activites ». La réponse suit JSON:API :
> une liste paginée par curseur. Ce qui est exposé de chaque CRA est décrit par
> la spécification de l'exposition des CRA v1.

## Rule: Seul un client qui détient la permission « Activites » lit les CRA v1

### Scenario: Un appel sans client API est refusé

* When un appel sans client API lit les CRA v1
* Then l'API refuse l'accès

### Scenario: Un client sans la permission est refusé

* Given un client API "Archives" avec les permissions "Structures"
* When le client API "Archives" lit les CRA v1
* Then l'API refuse l'accès

### Scenario: Un client qui détient la permission lit une liste JSON:API

* Given un client API "Archives" avec les permissions "Activites"
* When le client API "Archives" lit les CRA v1
* Then l'API répond par une liste JSON:API

## Rule: La taille de page est celle demandée, dans la limite de 500

### Scenario: La page a la taille demandée

* Given un client API "Archives" avec les permissions "Activites"
* When le client API "Archives" lit les CRA v1 avec "page[size]=1"
* Then la page lue annonce 1 élément par page

### Scenario: Une page de plus de 500 CRA est rejetée

* Given un client API "Archives" avec les permissions "Activites"
* When le client API "Archives" lit les CRA v1 avec "page[size]=501"
* Then l'API rejette la requête

## Rule: Un curseur illisible est rejeté

### Scenario: Un curseur qui n'a pas été donné par l'API est rejeté

* Given un client API "Archives" avec les permissions "Activites"
* When le client API "Archives" lit les CRA v1 avec "page[after]=inconnu"
* Then l'API rejette la requête
