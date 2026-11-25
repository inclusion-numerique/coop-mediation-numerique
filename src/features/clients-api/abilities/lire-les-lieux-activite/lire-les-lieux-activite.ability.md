# Fonctionnalité: Lire les lieux d'activité

> Un partenaire lit les lieux d'activité publiés par la coop par l'API v1, sur
> la route `/lieux-activite`, avec un client qui détient la permission
> « LieuxActivite ». Contrairement aux autres routes, la réponse est un simple
> tableau de lieux au format du standard des lieux de médiation numérique, sans
> pagination. Ce qui est publié de chaque lieu est décrit par la spécification
> de la publication des lieux.

## Règle: Seul un client qui détient la permission « LieuxActivite » lit les lieux

### Scénario: Un appel sans client API doit s'authentifier

* Quand un appel sans client API lit les lieux d'activité
* Alors l'API demande de s'authentifier

### Scénario: Un client sans la permission est refusé

* Étant donné un client API "Cartographie" avec les permissions "Structures"
* Quand le client API "Cartographie" lit les lieux d'activité
* Alors l'API refuse l'accès

## Règle: Le filtre par identifiants ne garde que les lieux demandés, 100 au plus

### Scénario: Un identifiant inconnu ne rend aucun lieu

* Étant donné un client API "Cartographie" avec les permissions "LieuxActivite"
* Quand le client API "Cartographie" lit les lieux d'activité avec "ids=00000000-0000-4000-8000-000000000000"
* Alors l'API répond par un tableau de 0 élément

### Scénario: Plus de 100 identifiants sont rejetés

* Étant donné un client API "Cartographie" avec les permissions "LieuxActivite"
* Quand le client API "Cartographie" demande 101 lieux d'activité par leurs identifiants
* Alors l'API rejette la requête

## Règle: Le filtre par dispositif n'accepte que les dispositifs du standard

### Scénario: Un dispositif inconnu est rejeté

* Étant donné un client API "Cartographie" avec les permissions "LieuxActivite"
* Quand le client API "Cartographie" lit les lieux d'activité avec "filter[dispositif_programmes_nationaux]=Inconnu"
* Alors l'API rejette la requête
