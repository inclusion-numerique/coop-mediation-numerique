# Feature: Renouveler le secret d'un client API

> L'administration génère un nouveau secret pour un client API, par exemple
> quand le précédent a fuité. Le nouveau secret n'est montré qu'une fois et
> remplace l'ancien.

## Rule: Le nouveau secret remplace l'ancien

### Scenario: Après renouvellement, seul le nouveau secret authentifie

* Given un client API "Tableau de bord" avec les permissions "Activites"
* When l'administration renouvelle le secret du client API "Tableau de bord"
* Then l'ancien secret du client API "Tableau de bord" n'authentifie plus
* And le nouveau secret du client API "Tableau de bord" authentifie

## Rule: Un client API inconnu n'a pas de secret à renouveler

### Scenario: Renouveler le secret d'un client inexistant échoue

* When l'administration renouvelle le secret d'un client API qui n'existe pas
* Then le renouvellement échoue car le client API est introuvable
