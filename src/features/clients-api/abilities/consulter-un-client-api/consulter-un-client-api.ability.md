# Fonctionnalité: Consulter un client API

> L'administration ouvre la fiche d'un client API pour le modifier ou en
> renouveler le secret.

## Règle: Un client API existant se consulte

### Scénario: L'administration consulte un client API

* Étant donné un client API "Tableau de bord" avec les permissions "Activites, Structures"
* Quand l'administration consulte le client API "Tableau de bord"
* Alors la fiche présente les permissions "Activites, Structures"

### Scénario: Un client API inconnu est introuvable

* Quand l'administration consulte un client API qui n'existe pas
* Alors la consultation échoue car le client API est introuvable
