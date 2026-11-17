# Feature: Consulter une invitation

## Rule: La personne invitée découvre l'équipe qu'on lui propose de rejoindre

### Scenario: Une personne ouvre une invitation en attente

* Given une invitation en attente dans une équipe de 2 membres
* When la personne invitée ouvre son invitation
* Then elle voit une invitation en attente
* And l'équipe compte 2 membres

### Scenario: Une adresse saisie en majuscules mène à la même invitation

* Given une invitation en attente dans une équipe de 0 membre
* When la personne invitée ouvre son invitation, connectée avec son email en majuscules
* Then elle voit une invitation en attente

## Rule: Une invitation ne s'ouvre qu'une fois traitée

### Scenario: Une invitation refusée n'est plus valide

* Given une invitation refusée
* When la personne invitée ouvre son invitation
* Then elle apprend que l'invitation n'est plus valide

## Rule: Une invitation ne se consulte pas avec le compte de quelqu'un d'autre

### Scenario: Une personne connectée avec une autre adresse est avertie

* Given une invitation en attente dans une équipe de 0 membre
* When une autre personne connectée ouvre cette invitation
* Then elle est avertie qu'il ne s'agit pas de son invitation
