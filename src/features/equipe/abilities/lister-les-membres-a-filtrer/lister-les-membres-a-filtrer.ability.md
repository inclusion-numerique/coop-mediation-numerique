# Fonctionnalité: Lister les membres à filtrer

> La barre des statistiques d'un coordinateur propose ses propres
> statistiques puis les médiateurs de son équipe : les membres actuels par
> nom, puis les anciens membres.

## Règle: Le demandeur d'abord, puis les membres, puis les anciens membres

### Scénario: Un coordinateur médiateur avec un membre et un ancien membre

* Étant donné un coordinateur médiateur "Alan Turing" à filtrer
* Et "Ada Lovelace" est membre de son équipe
* Et "Grace Hopper" a quitté son équipe
* Quand je liste les membres à filtrer de "Alan Turing"
* Alors les membres à filtrer sont "Alan Turing Demandeur, Ada Lovelace Membre, Grace Hopper AncienMembre"

## Règle: Un médiateur revenu dans l'équipe en est membre

### Scénario: Un départ suivi d'un retour

* Étant donné un coordinateur médiateur "Alan Turing" à filtrer
* Et "Grace Hopper" a quitté son équipe
* Et "Grace Hopper" est membre de son équipe
* Quand je liste les membres à filtrer de "Alan Turing"
* Alors les membres à filtrer sont "Alan Turing Demandeur, Grace Hopper Membre"
