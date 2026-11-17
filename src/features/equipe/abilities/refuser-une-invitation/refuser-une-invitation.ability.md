# Feature: Refuser une invitation

## Rule: La personne invitée refuse, sans avoir besoin de se connecter

> Le refus n'engage que la personne invitée : il reste possible depuis le lien
> reçu par email, même sans compte sur la Coop.

### Scenario: Une personne refuse l'invitation reçue

* Given une personne invitée à rejoindre une équipe
* When cette personne refuse l'invitation
* Then le refus réussit
* And l'invitation est marquée refusée

## Rule: On ne revient pas sur une réponse déjà donnée

### Scenario: Une invitation acceptée ne peut plus être refusée

* Given une personne qui a déjà accepté de rejoindre une équipe
* When cette personne refuse l'invitation
* Then le refus est rejeté
* And l'invitation reste acceptée
