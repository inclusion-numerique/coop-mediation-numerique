# Feature: Fusionner des comptes

> Une même personne a parfois deux comptes. L'administration fusionne le
> compte en double (la source) dans celui qu'on garde (la cible) : tout ce
> que la source portait passe à la cible, puis la source disparaît.

## Rule: Tout ce que porte la source passe à la cible

### Scenario: Fusionner deux médiateurs

* Given un compte source et un compte cible à fusionner
* When l'administration fusionne la source dans la cible
* Then la fusion des comptes aboutit
* And le compte source n'existe plus
* And le bénéficiaire de la source appartient à la cible
* And l'activité de la source appartient à la cible

## Rule: La personne se reconnecte sur le compte qu'on garde

> Supprimer la liaison ProConnect de la source ferait recréer un troisième
> compte à la prochaine connexion.

### Scenario: La liaison ProConnect de la source passe à la cible

* Given un compte source et un compte cible à fusionner
* When l'administration fusionne la source dans la cible
* Then la liaison ProConnect de la source appartient à la cible

### Scenario: Le compte RDV Service Public de la source passe à une cible qui n'en a pas

* Given un compte source et un compte cible à fusionner
* And la source est reliée à RDV Service Public
* When l'administration fusionne la source dans la cible
* Then le compte RDV Service Public appartient à la cible

## Rule: La personne connue de l'Entrepôt suit le compte qu'on garde

### Scenario: La personne de la source passe à une cible qui n'en a pas

* Given un compte source et un compte cible à fusionner
* And la source est connue de l'Entrepôt avec un contrat
* When l'administration fusionne la source dans la cible
* Then le contrat de la source appartient à la cible

### Scenario: Les contrats de la source rejoignent la personne de la cible

* Given un compte source et un compte cible à fusionner
* And la source est connue de l'Entrepôt avec un contrat
* And la cible est connue de l'Entrepôt
* When l'administration fusionne la source dans la cible
* Then le contrat de la source appartient à la cible
* And l'Entrepôt ne connaît plus qu'une personne pour la cible

## Rule: Les traces laissées par la source ne bloquent pas la fusion

### Scenario: Une source qui a modifié un lieu se fusionne

* Given un compte source et un compte cible à fusionner
* And la source a modifié un lieu d'activité
* When l'administration fusionne la source dans la cible
* Then la fusion des comptes aboutit
* And la dernière modification du lieu est attribuée à la cible

## Rule: On ne fusionne que deux comptes distincts, vers un compte vivant

### Scenario: Un compte ne se fusionne pas avec lui-même

* Given un compte source et un compte cible à fusionner
* When l'administration fusionne la source avec elle-même
* Then la fusion des comptes échoue avec l'erreur "FusionSurLeMemeCompte"
* And le compte source existe toujours

### Scenario: On ne fusionne pas vers un compte supprimé

* Given un compte source et un compte cible à fusionner
* And la cible est supprimée
* When l'administration fusionne la source dans la cible
* Then la fusion des comptes échoue avec l'erreur "CibleSupprimee"
