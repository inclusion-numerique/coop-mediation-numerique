# Feature: Accepter une invitation

## Rule: La personne invitée rejoint l'équipe en acceptant

### Scenario: Un médiateur inscrit accepte l'invitation

* Given un médiateur inscrit invité à rejoindre une équipe
* When ce médiateur accepte l'invitation
* Then l'acceptation réussit
* And ce médiateur est membre de l'équipe
* And l'invitation est marquée acceptée

### Scenario: Un ancien membre ré-invité retrouve sa place

* Given un ancien membre invité à rejoindre de nouveau l'équipe
* When ce médiateur accepte l'invitation
* Then l'acceptation réussit
* And ce médiateur est membre de l'équipe
* And son ancienne adhésion reste archivée

## Rule: Seule la personne invitée peut accepter, avec son propre compte

> L'invitation peut porter l'identifiant d'un médiateur, mais c'est le compte
> connecté qui rejoint l'équipe : un identifiant noté à l'envoi ne suffit pas à
> rattacher quelqu'un qui n'a rien accepté.

### Scenario: Un autre médiateur ne peut pas accepter à sa place

* Given un médiateur inscrit invité à rejoindre une équipe
* When un autre médiateur accepte cette invitation
* Then l'acceptation est refusée
* And ce médiateur n'est pas membre de l'équipe

### Scenario: Le médiateur noté sur l'invitation n'est pas rattaché à la place de celui qui accepte

* Given une invitation adressée à une personne mais notée au nom d'un autre médiateur
* When la personne invitée accepte l'invitation
* Then l'acceptation réussit
* And la personne invitée est membre de l'équipe
* And le médiateur noté n'est pas membre de l'équipe

## Rule: L'inscription doit être validée pour rejoindre une équipe

### Scenario: Un médiateur en cours d'inscription doit d'abord la finaliser

* Given un médiateur en cours d'inscription invité à rejoindre une équipe
* When ce médiateur accepte l'invitation
* Then l'acceptation est refusée
* And l'invitation reste en attente
