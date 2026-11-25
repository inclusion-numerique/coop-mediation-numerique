# Fonctionnalité: Renouveler le secret d'un client API

> L'administration génère un nouveau secret pour un client API, par exemple
> quand le précédent a fuité. Le nouveau secret n'est montré qu'une fois et
> remplace l'ancien.

## Règle: Le nouveau secret remplace l'ancien

### Scénario: Après renouvellement, seul le nouveau secret authentifie

* Étant donné un client API "Tableau de bord" avec les permissions "Activites"
* Quand l'administration renouvelle le secret du client API "Tableau de bord"
* Alors l'ancien secret du client API "Tableau de bord" n'authentifie plus
* Et le nouveau secret du client API "Tableau de bord" authentifie

## Règle: Un client API inconnu n'a pas de secret à renouveler

### Scénario: Renouveler le secret d'un client inexistant échoue

* Quand l'administration renouvelle le secret d'un client API qui n'existe pas
* Alors le renouvellement échoue car le client API est introuvable
