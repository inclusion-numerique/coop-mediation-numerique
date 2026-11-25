# Fonctionnalité: Déclencher une synchronisation RDV Service Public

## Règle: Chacun pour soi, l'assistance pour tous

### Scénario: Un médiateur synchronise son propre compte

* Étant donné un compte RDV synchronisable
* Quand je déclenche une synchronisation complète pour moi-même
* Alors la synchronisation a parcouru toutes les organisations

### Scénario: Un médiateur ne synchronise pas le compte d'un autre

* Étant donné un compte RDV synchronisable
* Quand je déclenche une synchronisation complète pour un autre médiateur
* Alors le déclenchement échoue avec l’erreur "NonAutorise"
* Et aucune synchronisation n’a été lancée

### Scénario: L'assistance synchronise le compte d'un tiers

* Étant donné un compte RDV synchronisable
* Quand un administrateur déclenche une synchronisation complète pour moi
* Alors la synchronisation a parcouru toutes les organisations

## Règle: Le rattrapage ne parcourt que ce que les webhooks n'ont pas rapporté

### Scénario: Rattraper les organisations dont le webhook a échoué

* Étant donné un compte RDV synchronisable dont les webhooks ont échoué sur les organisations "9920001,9920002"
* Quand je déclenche un rattrapage pour moi-même
* Alors la synchronisation a parcouru les organisations "9920001,9920002"

### Scénario: Rien à rattraper quand tous les webhooks sont posés

* Étant donné un compte RDV synchronisable
* Quand je déclenche un rattrapage pour moi-même
* Alors aucune synchronisation n’a été lancée
* Et le déclenchement ne rend aucune date de synchronisation

### Scénario: Une synchronisation complète reste possible sans webhook en attente

* Étant donné un compte RDV synchronisable
* Quand je déclenche une synchronisation complète pour moi-même
* Alors la synchronisation a parcouru toutes les organisations

## Règle: Un compte sans jetons n'est pas appelé

### Scénario: Compte déconnecté

* Étant donné un compte RDV déconnecté à synchroniser
* Quand je déclenche une synchronisation complète pour moi-même
* Alors aucune synchronisation n’a été lancée
* Et le déclenchement réussit sans dérive

## Règle: Un compte en erreur n'est plus appelé

Un compte n'est marqué en erreur que sur un échec qu'un nouvel essai ne résout
pas : jeton révoqué, agent supprimé, accès refusé. Il n'en sort que par une
reconnexion OAuth du médiateur, ou par une relance de l'assistance.

### Scénario: Le médiateur ne relance pas un compte en erreur

* Étant donné un compte RDV en erreur à synchroniser
* Quand je déclenche une synchronisation complète pour moi-même
* Alors aucune synchronisation n’a été lancée
* Et le déclenchement réussit sans dérive

### Scénario: Aucun rattrapage au chargement d'un écran

* Étant donné un compte RDV en erreur à synchroniser
* Quand je déclenche un rattrapage pour moi-même
* Alors aucune synchronisation n’a été lancée

### Scénario: L'assistance relance un compte en erreur

* Étant donné un compte RDV en erreur à synchroniser
* Quand un administrateur déclenche une synchronisation complète pour moi
* Alors la synchronisation a parcouru toutes les organisations

## Règle: Un échec est consigné sur le compte

### Scénario: La passe échoue

* Étant donné un compte RDV synchronisable
* Et la synchronisation échoue
* Quand je déclenche une synchronisation complète pour moi-même
* Alors le déclenchement échoue avec l’erreur "SynchronisationEchouee"
* Et le compte porte l’erreur "Impossible de récupérer les données du compte RDV Service Public"
* Et la date de dernière tentative est enregistrée

## Règle: Sans compte, il n'y a rien à synchroniser

### Scénario: Aucun compte connecté

* Étant donné aucun compte RDV à synchroniser
* Quand je déclenche une synchronisation complète pour moi-même
* Alors le déclenchement échoue avec l’erreur "CompteRdvIntrouvable"
