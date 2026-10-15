# Feature: Annuler une invitation

## Rule: Seule une invitation encore en attente s'annule

### Scenario: Le coordinateur annule une invitation en attente

* Given un coordinateur qui a invité une personne
* When le coordinateur annule cette invitation
* Then l'annulation réussit
* And cette invitation n'existe plus

### Scenario: Une invitation acceptée ne s'annule pas

* Given un coordinateur dont l'invitation a été acceptée
* When le coordinateur annule cette invitation
* Then l'annulation est refusée
* And cette invitation existe toujours

## Rule: Seul le coordinateur de l'équipe ou un administrateur annule ses invitations

### Scenario: Le coordinateur d'une autre équipe ne peut pas l'annuler

* Given un coordinateur qui a invité une personne
* When le coordinateur d'une autre équipe annule cette invitation
* Then l'annulation est refusée
* And cette invitation existe toujours
