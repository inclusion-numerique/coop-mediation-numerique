# Feature: Relancer une invitation

## Rule: Une invitation en attente se relance, et la relance est datée

### Scenario: Le coordinateur relance une invitation en attente

* Given un coordinateur qui attend la réponse d'une personne invitée
* When le coordinateur relance cette invitation
* Then la relance réussit
* And l'invitation porte la date de sa relance

### Scenario: Une invitation refusée ne se relance pas

* Given un coordinateur dont l'invitation a été refusée
* When le coordinateur relance cette invitation
* Then la relance est refusée

## Rule: Seul le coordinateur de l'équipe ou un administrateur relance ses invitations

### Scenario: Le coordinateur d'une autre équipe ne peut pas la relancer

* Given un coordinateur qui attend la réponse d'une personne invitée
* When le coordinateur d'une autre équipe relance cette invitation
* Then la relance est refusée
