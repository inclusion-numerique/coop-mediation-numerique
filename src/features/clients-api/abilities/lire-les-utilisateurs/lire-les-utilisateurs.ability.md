# Fonctionnalité: Lire les utilisateurs

> Un partenaire lit les utilisateurs de la coop par l'API v1, sur la route
> `/utilisateurs`, avec un client qui détient la permission « Utilisateurs ».
> La réponse suit JSON:API : une liste paginée par curseur. Ce qui est exposé
> de chaque utilisateur, et ce que font les filtres, est décrit par la
> spécification de l'exposition des utilisateurs.

## Règle: Seul un client qui détient la permission « Utilisateurs » lit les utilisateurs

### Scénario: Un appel sans client API doit s'authentifier

* Quand un appel sans client API lit les utilisateurs
* Alors l'API demande de s'authentifier

### Scénario: Un client sans la permission est refusé

* Étant donné un client API "Annuaire" avec les permissions "Structures"
* Quand le client API "Annuaire" lit les utilisateurs
* Alors l'API refuse l'accès

### Scénario: Un client qui détient la permission lit une liste JSON:API

* Étant donné un client API "Annuaire" avec les permissions "Utilisateurs"
* Quand le client API "Annuaire" lit les utilisateurs
* Alors l'API répond par une liste JSON:API

## Règle: Les filtres n'acceptent que les valeurs documentées

### Scénario: Un filtre conseiller numérique autre que 0 ou 1 est rejeté

* Étant donné un client API "Annuaire" avec les permissions "Utilisateurs"
* Quand le client API "Annuaire" lit les utilisateurs avec "filter[conseiller_numerique]=oui"
* Alors l'API rejette la requête

### Scénario: Un filtre de suppression autre que 0 ou 1 est rejeté

* Étant donné un client API "Annuaire" avec les permissions "Utilisateurs"
* Quand le client API "Annuaire" lit les utilisateurs avec "filter[soft_deleted]=oui"
* Alors l'API rejette la requête

## Règle: La taille de page est celle demandée, dans la limite de 500

### Scénario: La page a la taille demandée

* Étant donné un client API "Annuaire" avec les permissions "Utilisateurs"
* Quand le client API "Annuaire" lit les utilisateurs avec "page[size]=1"
* Alors la page lue annonce 1 élément par page

### Scénario: Une page de plus de 500 utilisateurs est rejetée

* Étant donné un client API "Annuaire" avec les permissions "Utilisateurs"
* Quand le client API "Annuaire" lit les utilisateurs avec "page[size]=501"
* Alors l'API rejette la requête
