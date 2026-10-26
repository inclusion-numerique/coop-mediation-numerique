# Feature: Créer un client API

> L'administration ouvre l'API de la Coop à un partenaire en lui créant un
> client : un nom unique, des permissions et une période de validité. Le
> secret n'est conservé que sous forme d'empreinte.

## Rule: Un client API se crée avec ses permissions et sa période

### Scenario: L'administration crée un client API

* When l'administration crée le client API "Tableau de bord" avec les permissions "Activites, Statistiques" à partir du 01/01/2026
* Then le client API "Tableau de bord" a les permissions "Activites, Statistiques"
* And le client API "Tableau de bord" est valable à partir du 01/01/2026, sans fin

## Rule: Deux clients API ne portent pas le même nom

### Scenario: Le nom d'un client existant est refusé

* Given un client API "Tableau de bord"
* When l'administration crée le client API "Tableau de bord" avec les permissions "Activites" à partir du 01/01/2026
* Then la création échoue car le nom est déjà pris
