# Fonctionnalité: Annuler une invitation

## Règle: Seule une invitation encore en attente s'annule

### Scénario: Le coordinateur annule une invitation en attente

* Étant donné un coordinateur qui a invité une personne
* Quand le coordinateur annule cette invitation
* Alors l'annulation réussit
* Et cette invitation n'existe plus

### Scénario: Une invitation acceptée ne s'annule pas

* Étant donné un coordinateur dont l'invitation a été acceptée
* Quand le coordinateur annule cette invitation
* Alors l'annulation est refusée
* Et cette invitation existe toujours

## Règle: Seul le coordinateur de l'équipe ou un administrateur annule ses invitations

### Scénario: Le coordinateur d'une autre équipe ne peut pas l'annuler

* Étant donné un coordinateur qui a invité une personne
* Quand le coordinateur d'une autre équipe annule cette invitation
* Alors l'annulation est refusée
* Et cette invitation existe toujours
