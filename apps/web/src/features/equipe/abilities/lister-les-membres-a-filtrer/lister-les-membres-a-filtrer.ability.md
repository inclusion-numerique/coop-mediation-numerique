# Feature: Lister les membres à filtrer

> La barre des statistiques d'un coordinateur propose ses propres
> statistiques puis les médiateurs de son équipe : les membres actuels par
> nom, puis les anciens membres.

## Rule: Le demandeur d'abord, puis les membres, puis les anciens membres

### Scenario: Un coordinateur médiateur avec un membre et un ancien membre

* Given un coordinateur médiateur "Alan Turing" à filtrer
* And "Ada Lovelace" est membre de son équipe
* And "Grace Hopper" a quitté son équipe
* When je liste les membres à filtrer de "Alan Turing"
* Then les membres à filtrer sont "Alan Turing Demandeur, Ada Lovelace Membre, Grace Hopper AncienMembre"

## Rule: Un médiateur revenu dans l'équipe en est membre

### Scenario: Un départ suivi d'un retour

* Given un coordinateur médiateur "Alan Turing" à filtrer
* And "Grace Hopper" a quitté son équipe
* And "Grace Hopper" est membre de son équipe
* When je liste les membres à filtrer de "Alan Turing"
* Then les membres à filtrer sont "Alan Turing Demandeur, Grace Hopper Membre"
