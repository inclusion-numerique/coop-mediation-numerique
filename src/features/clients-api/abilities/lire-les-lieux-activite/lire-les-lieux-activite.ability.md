# Feature: Lire les lieux d'activité

> Un partenaire lit les lieux d'activité publiés par la coop par l'API v1, sur
> la route `/lieux-activite`, avec un client qui détient la permission
> « LieuxActivite ». Contrairement aux autres routes, la réponse est un simple
> tableau de lieux au format du standard des lieux de médiation numérique, sans
> pagination. Ce qui est publié de chaque lieu est décrit par la spécification
> de la publication des lieux.

## Rule: Seul un client qui détient la permission « LieuxActivite » lit les lieux

### Scenario: Un appel sans client API doit s'authentifier

* When un appel sans client API lit les lieux d'activité
* Then l'API demande de s'authentifier

### Scenario: Un client sans la permission est refusé

* Given un client API "Cartographie" avec les permissions "Structures"
* When le client API "Cartographie" lit les lieux d'activité
* Then l'API refuse l'accès

## Rule: Le filtre par identifiants ne garde que les lieux demandés, 100 au plus

### Scenario: Un identifiant inconnu ne rend aucun lieu

* Given un client API "Cartographie" avec les permissions "LieuxActivite"
* When le client API "Cartographie" lit les lieux d'activité avec "ids=00000000-0000-4000-8000-000000000000"
* Then l'API répond par un tableau de 0 élément

### Scenario: Plus de 100 identifiants sont rejetés

* Given un client API "Cartographie" avec les permissions "LieuxActivite"
* When le client API "Cartographie" demande 101 lieux d'activité par leurs identifiants
* Then l'API rejette la requête

## Rule: Le filtre par dispositif n'accepte que les dispositifs du standard

### Scenario: Un dispositif inconnu est rejeté

* Given un client API "Cartographie" avec les permissions "LieuxActivite"
* When le client API "Cartographie" lit les lieux d'activité avec "filter[dispositif_programmes_nationaux]=Inconnu"
* Then l'API rejette la requête
