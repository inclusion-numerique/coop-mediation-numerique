# Fonctionnalité: Lire les activités

> Un partenaire lit les activités de la coop par l'API v1, sur la route
> `/activites`, avec un client qui détient la permission « Activites ». La
> réponse suit JSON:API : une liste paginée par curseur, de l'activité la plus
> récemment modifiée à la plus ancienne. Ce qui est exposé de chaque activité
> est décrit par la spécification de l'exposition des activités.
>
> Les scénarios filtrent sur des dates de modification lointaines, pour ne lire
> que les activités qu'ils sèment.

## Règle: Seul un client qui détient la permission « Activites » lit les activités

### Scénario: Un appel sans client API doit s'authentifier

* Quand un appel sans client API lit les activités
* Alors l'API demande de s'authentifier

### Scénario: Un client sans la permission est refusé

* Étant donné un client API "Tableau de bord" avec les permissions "Statistiques"
* Quand le client API "Tableau de bord" lit les activités
* Alors l'API refuse l'accès

### Scénario: Un client qui détient la permission lit une liste JSON:API

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Quand le client API "Tableau de bord" lit les activités
* Alors l'API répond par une liste JSON:API

## Règle: Les paramètres de la requête sont validés

### Scénario: Une page de plus de 500 activités est rejetée

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Quand le client API "Tableau de bord" lit les activités avec "page[size]=501"
* Alors l'API rejette la requête

### Scénario: Une date de modification illisible est rejetée

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Quand le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=hier"
* Alors l'API rejette la requête

## Règle: Le filtre de modification ne garde que les activités modifiées depuis la date demandée

### Scénario: Une activité modifiée avant la date est écartée

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Et des activités modifiées le 01/01/2099 et le 02/01/2099
* Quand le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=2099-01-02T00:00:00Z"
* Alors la page lue annonce un total de 1 élément
* Et la première activité lue est celle modifiée le 02/01/2099

## Règle: Les activités se lisent page par page, en suivant le curseur

### Scénario: La première page commence par l'activité la plus récemment modifiée

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Et des activités modifiées le 01/01/2099 et le 02/01/2099
* Quand le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=2099-01-01T00:00:00Z&page[size]=1"
* Alors la page lue contient 1 élément
* Et la page lue annonce un total de 2 éléments
* Et la page lue annonce une page suivante
* Et la première activité lue est celle modifiée le 02/01/2099

### Scénario: Le lien vers la page suivante reprend après la dernière activité lue

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Et des activités modifiées le 01/01/2099 et le 02/01/2099
* Quand le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=2099-01-01T00:00:00Z&page[size]=1"
* Et le client API "Tableau de bord" suit le lien vers la page suivante des activités
* Alors la page lue contient 1 élément
* Et la première activité lue est celle modifiée le 01/01/2099
