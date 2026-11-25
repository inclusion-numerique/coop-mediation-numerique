# Fonctionnalité: Créer un client API

> L'administration ouvre l'API de la Coop à un partenaire en lui créant un
> client : un nom unique, des permissions et une période de validité. Le
> secret n'est conservé que sous forme d'empreinte.

## Règle: Un client API se crée avec ses permissions et sa période

### Scénario: L'administration crée un client API

* Quand l'administration crée le client API "Tableau de bord" avec les permissions "Activites, Statistiques" à partir du 01/01/2026
* Alors le client API "Tableau de bord" a les permissions "Activites, Statistiques"
* Et le client API "Tableau de bord" est valable à partir du 01/01/2026, sans fin

## Règle: Deux clients API ne portent pas le même nom

### Scénario: Le nom d'un client existant est refusé

* Étant donné un client API "Tableau de bord"
* Quand l'administration crée le client API "Tableau de bord" avec les permissions "Activites" à partir du 01/01/2026
* Alors la création échoue car le nom est déjà pris
