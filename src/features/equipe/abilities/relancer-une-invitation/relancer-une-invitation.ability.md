# Fonctionnalité: Relancer une invitation

## Règle: Une invitation en attente se relance, et la relance est datée

### Scénario: Le coordinateur relance une invitation en attente

* Étant donné un coordinateur qui attend la réponse d'une personne invitée
* Quand le coordinateur relance cette invitation
* Alors la relance réussit
* Et l'invitation porte la date de sa relance

### Scénario: Une invitation tout juste envoyée ne se relance pas

* Étant donné un coordinateur qui vient d'inviter une personne
* Quand le coordinateur relance cette invitation
* Alors la relance est refusée

### Scénario: Une invitation refusée ne se relance pas

* Étant donné un coordinateur dont l'invitation a été refusée
* Quand le coordinateur relance cette invitation
* Alors la relance est refusée

## Règle: Seul le coordinateur de l'équipe ou un administrateur relance ses invitations

### Scénario: Le coordinateur d'une autre équipe ne peut pas la relancer

* Étant donné un coordinateur qui attend la réponse d'une personne invitée
* Quand le coordinateur d'une autre équipe relance cette invitation
* Alors la relance est refusée
