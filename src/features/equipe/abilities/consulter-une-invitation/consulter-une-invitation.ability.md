# Fonctionnalité: Consulter une invitation

## Règle: La personne invitée découvre l'équipe qu'on lui propose de rejoindre

### Scénario: Une personne ouvre une invitation en attente

* Étant donné une invitation en attente dans une équipe de 2 membres
* Quand la personne invitée ouvre son invitation
* Alors elle voit une invitation en attente
* Et l'équipe compte 2 membres

### Scénario: Une adresse saisie en majuscules mène à la même invitation

* Étant donné une invitation en attente dans une équipe de 0 membre
* Quand la personne invitée ouvre son invitation, connectée avec son email en majuscules
* Alors elle voit une invitation en attente

## Règle: Une invitation ne s'ouvre qu'une fois traitée

### Scénario: Une invitation refusée n'est plus valide

* Étant donné une invitation refusée
* Quand la personne invitée ouvre son invitation
* Alors elle apprend que l'invitation n'est plus valide

## Règle: Une invitation ne se consulte pas avec le compte de quelqu'un d'autre

### Scénario: Une personne connectée avec une autre adresse est avertie

* Étant donné une invitation en attente dans une équipe de 0 membre
* Quand une autre personne connectée ouvre cette invitation
* Alors elle est avertie qu'il ne s'agit pas de son invitation
