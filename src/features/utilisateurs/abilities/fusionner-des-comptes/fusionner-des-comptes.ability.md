# Fonctionnalité: Fusionner des comptes

> Une même personne a parfois deux comptes. L'administration fusionne le
> compte en double (la source) dans celui qu'on garde (la cible) : tout ce
> que la source portait passe à la cible, puis la source disparaît.

## Règle: Tout ce que porte la source passe à la cible

### Scénario: Fusionner deux médiateurs

* Étant donné un compte source et un compte cible à fusionner
* Quand l'administration fusionne la source dans la cible
* Alors la fusion des comptes aboutit
* Et le compte source n'existe plus
* Et le bénéficiaire de la source appartient à la cible
* Et l'activité de la source appartient à la cible

## Règle: La cible garde une seule invitation par équipe

> Une invitation se reconnaît à son adresse : celle acceptée à l'inscription
> n'est rattachée au compte que par elle.

### Scénario: Deux comptes membres de la même équipe se fusionnent

* Étant donné un compte source et un compte cible à fusionner
* Et la source et la cible ont accepté une invitation de la même équipe
* Et l'invitation de la cible n'est rattachée qu'à son adresse
* Quand l'administration fusionne la source dans la cible
* Alors la fusion des comptes aboutit
* Et la cible n'a plus qu'une invitation de l'équipe, rattachée à son compte

## Règle: La personne se reconnecte sur le compte qu'on garde

> Supprimer la liaison ProConnect de la source ferait recréer un troisième
> compte à la prochaine connexion.

### Scénario: La liaison ProConnect de la source passe à la cible

* Étant donné un compte source et un compte cible à fusionner
* Quand l'administration fusionne la source dans la cible
* Alors la liaison ProConnect de la source appartient à la cible

### Scénario: Le compte RDV Service Public de la source passe à une cible qui n'en a pas

* Étant donné un compte source et un compte cible à fusionner
* Et la source est reliée à RDV Service Public
* Quand l'administration fusionne la source dans la cible
* Alors le compte RDV Service Public appartient à la cible

## Règle: La personne connue de l'Entrepôt suit le compte qu'on garde

### Scénario: La personne de la source passe à une cible qui n'en a pas

* Étant donné un compte source et un compte cible à fusionner
* Et la source est connue de l'Entrepôt avec un contrat
* Quand l'administration fusionne la source dans la cible
* Alors le contrat de la source appartient à la cible

### Scénario: Les contrats de la source rejoignent la personne de la cible

* Étant donné un compte source et un compte cible à fusionner
* Et la source est connue de l'Entrepôt avec un contrat
* Et la cible est connue de l'Entrepôt
* Quand l'administration fusionne la source dans la cible
* Alors le contrat de la source appartient à la cible
* Et l'Entrepôt ne connaît plus qu'une personne pour la cible

## Règle: Les traces laissées par la source ne bloquent pas la fusion

### Scénario: Une source qui a modifié un lieu se fusionne

* Étant donné un compte source et un compte cible à fusionner
* Et la source a modifié un lieu d'activité
* Quand l'administration fusionne la source dans la cible
* Alors la fusion des comptes aboutit
* Et la dernière modification du lieu est attribuée à la cible

## Règle: On ne fusionne que deux comptes distincts, vers un compte vivant

### Scénario: Un compte ne se fusionne pas avec lui-même

* Étant donné un compte source et un compte cible à fusionner
* Quand l'administration fusionne la source avec elle-même
* Alors la fusion des comptes échoue avec l'erreur "FusionSurLeMemeCompte"
* Et le compte source existe toujours

### Scénario: On ne fusionne pas vers un compte supprimé

* Étant donné un compte source et un compte cible à fusionner
* Et la cible est supprimée
* Quand l'administration fusionne la source dans la cible
* Alors la fusion des comptes échoue avec l'erreur "CibleSupprimee"

## Règle: La cible reçoit les rôles que portait la source

### Scénario: Une cible sans rôle devient médiatrice

* Étant donné un compte source médiateur et une cible sans rôle à fusionner
* Quand l'administration fusionne la source dans la cible
* Alors la fusion des comptes aboutit
* Et la cible est devenue médiatrice et porte le bénéficiaire de la source

## Règle: Un partage des statistiques révoqué par la source le reste après la fusion

### Scénario: La source avait révoqué le partage que la cible maintenait

* Étant donné un compte source et un compte cible à fusionner
* Et la source a révoqué le partage de ses statistiques que la cible maintient
* Quand l'administration fusionne la source dans la cible
* Alors la fusion des comptes aboutit
* Et le partage des statistiques de la cible est révoqué
