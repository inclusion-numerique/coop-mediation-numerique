# Fonctionnalité: Refuser une invitation

## Règle: La personne invitée refuse, sans avoir besoin de se connecter

> Le refus n'engage que la personne invitée : il reste possible depuis le lien
> reçu par email, même sans compte sur la Coop.

### Scénario: Une personne refuse l'invitation reçue

* Étant donné une personne invitée à rejoindre une équipe
* Quand cette personne refuse l'invitation
* Alors le refus réussit
* Et l'invitation est marquée refusée

## Règle: On ne revient pas sur une réponse déjà donnée

### Scénario: Une invitation acceptée ne peut plus être refusée

* Étant donné une personne qui a déjà accepté de rejoindre une équipe
* Quand cette personne refuse l'invitation
* Alors le refus est rejeté
* Et l'invitation reste acceptée
