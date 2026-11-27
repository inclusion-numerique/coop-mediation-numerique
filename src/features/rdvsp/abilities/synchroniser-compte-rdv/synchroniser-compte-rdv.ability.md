# Fonctionnalité: Synchroniser un compte RDV Service Public

L’ability enchaîne trois réconciliations et tient la trace de la passe. Les
réconciliations elles-mêmes ont leurs propres scénarios ; ce qui est éprouvé ici
est l’enchaînement — son ordre, son arrêt au premier échec, et ce qu’il consigne.

## Règle: Les trois réconciliations s’enchaînent dans l’ordre

L’ordre n’est pas indifférent : les organisations d’abord, dont les rendez-vous
dépendent ; les rendez-vous ensuite, qui amènent motifs, lieux et usagers ; les
webhooks en dernier, pour que les notifications reprennent sur un état à jour.

### Scénario: Passe complète

* Étant donné un compte RDV à réconcilier
* Quand je synchronise tout le compte
* Alors les réconciliations se sont enchaînées dans l’ordre "organisations,rendez-vous,webhooks"
* Et la passe rend une dérive de 3
* Et le journal de la passe est clôturé sans erreur
* Et le journal de la passe s’ouvre à l’instant de la passe
* Et le journal de la passe consigne une portée complète

### Scénario: Les organisations échouent

* Étant donné un compte RDV à réconcilier
* Et la réconciliation des organisations échoue
* Quand je synchronise tout le compte
* Alors la passe de synchronisation échoue
* Et les réconciliations se sont enchaînées dans l’ordre "organisations"
* Et le journal de la passe porte une erreur

### Scénario: Les rendez-vous échouent

* Étant donné un compte RDV à réconcilier
* Et la réconciliation des rendez-vous échoue
* Quand je synchronise tout le compte
* Alors la passe de synchronisation échoue
* Et les réconciliations se sont enchaînées dans l’ordre "organisations,rendez-vous"
* Et le journal de la passe porte une erreur

### Scénario: Une réconciliation lève

Une exception ne doit pas emporter la trace : c’est elle que l’administration
lit quand un compte cesse de se synchroniser.

* Étant donné un compte RDV à réconcilier
* Et la réconciliation des rendez-vous lève une exception
* Quand je synchronise tout le compte en rattrapant l’exception
* Alors le journal de la passe porte une erreur

## Règle: La portée restreint la passe sans la vider

### Scénario: Portée vide

Aucune organisation à rattraper : il n’y a rien à faire, et surtout pas tout.

* Étant donné un compte RDV à réconcilier
* Quand je synchronise une portée vide
* Alors aucune réconciliation n’a été lancée
* Et aucun journal de passe n’a été ouvert
* Et la passe rend une dérive de 0

### Scénario: Portée restreinte à quelques organisations

* Étant donné un compte RDV à réconcilier
* Quand je synchronise les organisations "101,102"
* Alors les réconciliations se sont enchaînées dans l’ordre "rendez-vous,webhooks"
* Et les rendez-vous ont été réconciliés sur les organisations "101,102"
* Et le journal de la passe consigne la portée "101,102"

## Règle: Les organisations sans webhook remontent à l’appelant

### Scénario: Une organisation refuse la pose

* Étant donné un compte RDV à réconcilier
* Et la pose de webhook échoue sur l’organisation "101"
* Quand je synchronise tout le compte
* Alors la passe signale les organisations sans webhook "101"

## Règle: Les webhooks ne visent que ce que la passe a reçu

Le cache des organisations peut garder une organisation que RDV Service Public
ne renvoie plus : il n’est jamais vidé d’un coup. La pose de webhook, elle, ne
s’adresse qu’aux organisations que la passe vient de recevoir.

### Scénario: Une organisation gardée en cache n’est plus sollicitée

* Étant donné un compte RDV à réconcilier
* Et RDV Service Public ne renvoie que les organisations "101"
* Quand je synchronise tout le compte
* Alors les webhooks ont visé les seules organisations reçues "101"

## Règle: Une organisation qui refuse l’accès est détachée

### Scénario: Refus d’accès pendant un rattrapage

* Étant donné un compte RDV à réconcilier
* Et l’organisation "102" refuse l’accès à ses rendez-vous
* Quand je synchronise les organisations "101,102"
* Alors les organisations "102" ont été détachées du compte
* Et les webhooks ont été réconciliés sur les organisations "101"
* Et le journal de la passe est clôturé sans erreur

### Scénario: Aucun refus, aucun détachement

* Étant donné un compte RDV à réconcilier
* Quand je synchronise les organisations "101,102"
* Alors aucune organisation n’a été détachée du compte
