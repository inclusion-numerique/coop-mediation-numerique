# Feature: Synchroniser les organisations d'un compte RDV

## Rule: Les organisations reçues sont créées ou mises à jour

### Scenario: Organisation inconnue de La Coop

* Given un compte RDV à synchroniser sans organisation
* And RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* When je synchronise les organisations
* Then l’organisation 1 existe et se nomme "Médiathèque"
* And le bilan compte 1 création

### Scenario: Organisation dont le nom a changé

* Given un compte RDV à synchroniser rattaché à l’organisation 1 nommée "Ancien nom"
* And RDV Service Public renvoie l’organisation 1 nommée "Nouveau nom"
* When je synchronise les organisations
* Then l’organisation 1 existe et se nomme "Nouveau nom"
* And le bilan compte 1 mise à jour

### Scenario: Organisation inchangée

* Given un compte RDV à synchroniser rattaché à l’organisation 1 nommée "Médiathèque"
* And RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* When je synchronise les organisations
* Then le bilan compte 1 organisation inchangée

## Rule: Les rattachements du compte suivent ce que renvoie l'API

### Scenario: Rattachement d'une nouvelle organisation

* Given un compte RDV à synchroniser sans organisation
* And RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* When je synchronise les organisations
* Then le compte est rattaché à l’organisation 1

### Scenario: Détachement d'une organisation quittée

* Given un compte RDV à synchroniser rattaché à l’organisation 1 nommée "Médiathèque"
* And un rattachement résiduel à l’organisation 2
* And RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* When je synchronise les organisations
* Then le compte n’est plus rattaché à l’organisation 2
* And le compte est rattaché à l’organisation 1

## Rule: Un échec de l'API laisse la base intacte

### Scenario: RDV Service Public injoignable

* Given un compte RDV à synchroniser sans organisation
* And RDV Service Public refusera de lister les organisations
* When je synchronise les organisations
* Then la synchronisation échoue avec l’erreur "ApiIndisponible"
* And l’organisation 1 n’existe pas
