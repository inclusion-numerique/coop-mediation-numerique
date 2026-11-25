# Fonctionnalité: Accepter une invitation

## Règle: La personne invitée rejoint l'équipe en acceptant

### Scénario: Un médiateur inscrit accepte l'invitation

* Étant donné un médiateur inscrit invité à rejoindre une équipe
* Quand ce médiateur accepte l'invitation
* Alors l'acceptation réussit
* Et ce médiateur est membre de l'équipe
* Et l'invitation est marquée acceptée

### Scénario: Un ancien membre ré-invité retrouve sa place

* Étant donné un ancien membre invité à rejoindre de nouveau l'équipe
* Quand ce médiateur accepte l'invitation
* Alors l'acceptation réussit
* Et ce médiateur est membre de l'équipe
* Et son ancienne adhésion reste archivée

## Règle: Seule la personne invitée peut accepter, avec son propre compte

> L'invitation peut porter l'identifiant d'un médiateur, mais c'est le compte
> connecté qui rejoint l'équipe : un identifiant noté à l'envoi ne suffit pas à
> rattacher quelqu'un qui n'a rien accepté.

### Scénario: Un autre médiateur ne peut pas accepter à sa place

* Étant donné un médiateur inscrit invité à rejoindre une équipe
* Quand un autre médiateur accepte cette invitation
* Alors l'acceptation est refusée
* Et ce médiateur n'est pas membre de l'équipe

### Scénario: Le médiateur noté sur l'invitation n'est pas rattaché à la place de celui qui accepte

* Étant donné une invitation adressée à une personne mais notée au nom d'un autre médiateur
* Quand la personne invitée accepte l'invitation
* Alors l'acceptation réussit
* Et la personne invitée est membre de l'équipe
* Et le médiateur noté n'est pas membre de l'équipe

## Règle: L'inscription doit être validée pour rejoindre une équipe

### Scénario: Un médiateur en cours d'inscription doit d'abord la finaliser

* Étant donné un médiateur en cours d'inscription invité à rejoindre une équipe
* Quand ce médiateur accepte l'invitation
* Alors l'acceptation est refusée
* Et l'invitation reste en attente
