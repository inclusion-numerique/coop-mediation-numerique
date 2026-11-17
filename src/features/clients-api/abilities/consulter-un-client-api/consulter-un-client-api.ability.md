# Feature: Consulter un client API

> L'administration ouvre la fiche d'un client API pour le modifier ou en
> renouveler le secret.

## Rule: Un client API existant se consulte

### Scenario: L'administration consulte un client API

* Given un client API "Tableau de bord" avec les permissions "Activites, Structures"
* When l'administration consulte le client API "Tableau de bord"
* Then la fiche présente les permissions "Activites, Structures"

### Scenario: Un client API inconnu est introuvable

* When l'administration consulte un client API qui n'existe pas
* Then la consultation échoue car le client API est introuvable
