# Feature: Synchroniser un compte RDV Service Public

L’ability enchaîne trois réconciliations et tient la trace de la passe. Les
réconciliations elles-mêmes ont leurs propres scénarios ; ce qui est éprouvé ici
est l’enchaînement — son ordre, son arrêt au premier échec, et ce qu’il consigne.

## Rule: Les trois réconciliations s’enchaînent dans l’ordre

L’ordre n’est pas indifférent : les organisations d’abord, dont les rendez-vous
dépendent ; les rendez-vous ensuite, qui amènent motifs, lieux et usagers ; les
webhooks en dernier, pour que les notifications reprennent sur un état à jour.

### Scenario: Passe complète

* Given un compte RDV à réconcilier
* When je synchronise tout le compte
* Then les réconciliations se sont enchaînées dans l’ordre "organisations,rendez-vous,webhooks"
* And la passe rend une dérive de 3
* And le journal de la passe est clôturé sans erreur
* And le journal de la passe consigne une portée complète

### Scenario: Les organisations échouent

* Given un compte RDV à réconcilier
* And la réconciliation des organisations échoue
* When je synchronise tout le compte
* Then la passe de synchronisation échoue
* And les réconciliations se sont enchaînées dans l’ordre "organisations"
* And le journal de la passe porte une erreur

### Scenario: Les rendez-vous échouent

* Given un compte RDV à réconcilier
* And la réconciliation des rendez-vous échoue
* When je synchronise tout le compte
* Then la passe de synchronisation échoue
* And les réconciliations se sont enchaînées dans l’ordre "organisations,rendez-vous"
* And le journal de la passe porte une erreur

### Scenario: Une réconciliation lève

Une exception ne doit pas emporter la trace : c’est elle que l’administration
lit quand un compte cesse de se synchroniser.

* Given un compte RDV à réconcilier
* And la réconciliation des rendez-vous lève une exception
* When je synchronise tout le compte en rattrapant l’exception
* Then le journal de la passe porte une erreur

## Rule: La portée restreint la passe sans la vider

### Scenario: Portée vide

Aucune organisation à rattraper : il n’y a rien à faire, et surtout pas tout.

* Given un compte RDV à réconcilier
* When je synchronise une portée vide
* Then aucune réconciliation n’a été lancée
* And aucun journal de passe n’a été ouvert
* And la passe rend une dérive de 0

### Scenario: Portée restreinte à quelques organisations

* Given un compte RDV à réconcilier
* When je synchronise les organisations "101,102"
* Then les réconciliations se sont enchaînées dans l’ordre "rendez-vous,webhooks"
* And les rendez-vous ont été réconciliés sur les organisations "101,102"
* And le journal de la passe consigne la portée "101,102"

## Rule: Les organisations sans webhook remontent à l’appelant

### Scenario: Une organisation refuse la pose

* Given un compte RDV à réconcilier
* And la pose de webhook échoue sur l’organisation "101"
* When je synchronise tout le compte
* Then la passe signale les organisations sans webhook "101"
