# Fonctionnalité: Accepter les invitations en attente

> Un coordinateur peut inviter une personne avant qu'elle ait un compte. Quand
> cette personne valide son inscription comme médiateur, les invitations qui
> l'attendaient sont acceptées et elle rejoint les équipes qui l'ont invitée.

## Règle: Le médiateur rejoint les équipes qui l'attendaient

### Scénario: Une invitation en attente est acceptée et le médiateur rejoint l'équipe

* Étant donné un médiateur invité par une équipe avant son inscription
* Quand ses invitations en attente sont acceptées
* Alors son invitation en attente est désormais acceptée
* Et son invitation est rattachée à son compte médiateur
* Et il a rejoint l'équipe qui l'avait invité

## Règle: Une invitation refusée reste refusée

### Scénario: Une invitation refusée n'est pas acceptée

* Étant donné un médiateur qui a refusé l'invitation d'une équipe
* Quand ses invitations en attente sont acceptées
* Alors son invitation refusée le reste
* Et il n'a pas rejoint cette équipe
