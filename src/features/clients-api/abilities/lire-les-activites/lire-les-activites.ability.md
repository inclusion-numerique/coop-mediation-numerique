# Feature: Lire les activités

> Un partenaire lit les activités de la coop par l'API v1, sur la route
> `/activites`, avec un client qui détient la permission « Activites ». La
> réponse suit JSON:API : une liste paginée par curseur, de l'activité la plus
> récemment modifiée à la plus ancienne. Ce qui est exposé de chaque activité
> est décrit par la spécification de l'exposition des activités.
>
> Les scénarios filtrent sur des dates de modification lointaines, pour ne lire
> que les activités qu'ils sèment.

## Rule: Seul un client qui détient la permission « Activites » lit les activités

### Scenario: Un appel sans client API doit s'authentifier

* When un appel sans client API lit les activités
* Then l'API demande de s'authentifier

### Scenario: Un client sans la permission est refusé

* Given un client API "Tableau de bord" avec les permissions "Statistiques"
* When le client API "Tableau de bord" lit les activités
* Then l'API refuse l'accès

### Scenario: Un client qui détient la permission lit une liste JSON:API

* Given un client API "Tableau de bord" avec les permissions "Activites"
* When le client API "Tableau de bord" lit les activités
* Then l'API répond par une liste JSON:API

## Rule: Les paramètres de la requête sont validés

### Scenario: Une page de plus de 500 activités est rejetée

* Given un client API "Tableau de bord" avec les permissions "Activites"
* When le client API "Tableau de bord" lit les activités avec "page[size]=501"
* Then l'API rejette la requête

### Scenario: Une date de modification illisible est rejetée

* Given un client API "Tableau de bord" avec les permissions "Activites"
* When le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=hier"
* Then l'API rejette la requête

## Rule: Le filtre de modification ne garde que les activités modifiées depuis la date demandée

### Scenario: Une activité modifiée avant la date est écartée

* Given un client API "Tableau de bord" avec les permissions "Activites"
* And des activités modifiées le 01/01/2099 et le 02/01/2099
* When le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=2099-01-02T00:00:00Z"
* Then la page lue annonce un total de 1 élément
* And la première activité lue est celle modifiée le 02/01/2099

## Rule: Les activités se lisent page par page, en suivant le curseur

### Scenario: La première page commence par l'activité la plus récemment modifiée

* Given un client API "Tableau de bord" avec les permissions "Activites"
* And des activités modifiées le 01/01/2099 et le 02/01/2099
* When le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=2099-01-01T00:00:00Z&page[size]=1"
* Then la page lue contient 1 élément
* And la page lue annonce un total de 2 éléments
* And la page lue annonce une page suivante
* And la première activité lue est celle modifiée le 02/01/2099

### Scenario: Le lien vers la page suivante reprend après la dernière activité lue

* Given un client API "Tableau de bord" avec les permissions "Activites"
* And des activités modifiées le 01/01/2099 et le 02/01/2099
* When le client API "Tableau de bord" lit les activités avec "filter[modification][depuis]=2099-01-01T00:00:00Z&page[size]=1"
* And le client API "Tableau de bord" suit le lien vers la page suivante des activités
* Then la page lue contient 1 élément
* And la première activité lue est celle modifiée le 01/01/2099
