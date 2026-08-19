# Feature: Déclencher une synchronisation RDV Service Public

## Rule: Chacun pour soi, l'assistance pour tous

### Scenario: Un médiateur synchronise son propre compte

* Given un compte RDV synchronisable
* When je déclenche une synchronisation complète pour moi-même
* Then la synchronisation a parcouru toutes les organisations

### Scenario: Un médiateur ne synchronise pas le compte d'un autre

* Given un compte RDV synchronisable
* When je déclenche une synchronisation complète pour un autre médiateur
* Then le déclenchement échoue avec l’erreur "NonAutorise"
* And aucune synchronisation n’a été lancée

### Scenario: L'assistance synchronise le compte d'un tiers

* Given un compte RDV synchronisable
* When un administrateur déclenche une synchronisation complète pour moi
* Then la synchronisation a parcouru toutes les organisations

## Rule: Le rattrapage ne parcourt que ce que les webhooks n'ont pas rapporté

### Scenario: Rattraper les organisations dont le webhook a échoué

* Given un compte RDV synchronisable dont les webhooks ont échoué sur les organisations "9920001,9920002"
* When je déclenche un rattrapage pour moi-même
* Then la synchronisation a parcouru les organisations "9920001,9920002"

### Scenario: Rien à rattraper quand tous les webhooks sont posés

* Given un compte RDV synchronisable
* When je déclenche un rattrapage pour moi-même
* Then aucune synchronisation n’a été lancée
* And le déclenchement ne rend aucune date de synchronisation

### Scenario: Une synchronisation complète reste possible sans webhook en attente

* Given un compte RDV synchronisable
* When je déclenche une synchronisation complète pour moi-même
* Then la synchronisation a parcouru toutes les organisations

## Rule: Un compte sans jetons n'est pas appelé

### Scenario: Compte déconnecté

* Given un compte RDV déconnecté à synchroniser
* When je déclenche une synchronisation complète pour moi-même
* Then aucune synchronisation n’a été lancée
* And le déclenchement réussit sans dérive

## Rule: Un échec est consigné sur le compte

### Scenario: La passe échoue

* Given un compte RDV synchronisable
* And la synchronisation échoue
* When je déclenche une synchronisation complète pour moi-même
* Then le déclenchement échoue avec l’erreur "SynchronisationEchouee"
* And le compte porte l’erreur "Impossible de récupérer les données du compte RDV Service Public"
* And la date de dernière tentative est enregistrée

## Rule: Sans compte, il n'y a rien à synchroniser

### Scenario: Aucun compte connecté

* Given aucun compte RDV à synchroniser
* When je déclenche une synchronisation complète pour moi-même
* Then le déclenchement échoue avec l’erreur "CompteRdvIntrouvable"
