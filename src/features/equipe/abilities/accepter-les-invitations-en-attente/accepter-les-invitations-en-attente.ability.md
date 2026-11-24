# Feature: Accepter les invitations en attente

> Un coordinateur peut inviter une personne avant qu'elle ait un compte. Quand
> cette personne valide son inscription comme médiateur, les invitations qui
> l'attendaient sont acceptées et elle rejoint les équipes qui l'ont invitée.

## Rule: Le médiateur rejoint les équipes qui l'attendaient

### Scenario: Une invitation en attente est acceptée et le médiateur rejoint l'équipe

* Given un médiateur invité par une équipe avant son inscription
* When ses invitations en attente sont acceptées
* Then son invitation en attente est désormais acceptée
* And son invitation est rattachée à son compte médiateur
* And il a rejoint l'équipe qui l'avait invité

## Rule: Une invitation refusée reste refusée

### Scenario: Une invitation refusée n'est pas acceptée

* Given un médiateur qui a refusé l'invitation d'une équipe
* When ses invitations en attente sont acceptées
* Then son invitation refusée le reste
* And il n'a pas rejoint cette équipe
