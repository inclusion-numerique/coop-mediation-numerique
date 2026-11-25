# Fonctionnalité: Lire les CRA v1

> Un partenaire lit les comptes rendus d'activité importés de la première
> version de la coop par l'API v1, sur la route `/archives-v1/cras`, avec un
> client qui détient la permission « Activites ». La réponse suit JSON:API :
> une liste paginée par curseur. Ce qui est exposé de chaque CRA est décrit par
> la spécification de l'exposition des CRA v1.

## Règle: Seul un client qui détient la permission « Activites » lit les CRA v1

### Scénario: Un appel sans client API doit s'authentifier

* Quand un appel sans client API lit les CRA v1
* Alors l'API demande de s'authentifier

### Scénario: Un client sans la permission est refusé

* Étant donné un client API "Archives" avec les permissions "Structures"
* Quand le client API "Archives" lit les CRA v1
* Alors l'API refuse l'accès

### Scénario: Un client qui détient la permission lit une liste JSON:API

* Étant donné un client API "Archives" avec les permissions "Activites"
* Quand le client API "Archives" lit les CRA v1
* Alors l'API répond par une liste JSON:API

## Règle: La taille de page est celle demandée, dans la limite de 500

### Scénario: La page a la taille demandée

* Étant donné un client API "Archives" avec les permissions "Activites"
* Quand le client API "Archives" lit les CRA v1 avec "page[size]=1"
* Alors la page lue annonce 1 élément par page

### Scénario: Une page de plus de 500 CRA est rejetée

* Étant donné un client API "Archives" avec les permissions "Activites"
* Quand le client API "Archives" lit les CRA v1 avec "page[size]=501"
* Alors l'API rejette la requête

## Règle: Un curseur illisible est rejeté

### Scénario: Un curseur qui n'a pas été donné par l'API est rejeté

* Étant donné un client API "Archives" avec les permissions "Activites"
* Quand le client API "Archives" lit les CRA v1 avec "page[after]=inconnu"
* Alors l'API rejette la requête
