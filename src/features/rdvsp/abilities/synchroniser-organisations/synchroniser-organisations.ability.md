# Fonctionnalité: Synchroniser les organisations d'un compte RDV

## Règle: Les organisations reçues sont créées ou mises à jour

### Scénario: Organisation inconnue de La Coop

* Étant donné un compte RDV à synchroniser sans organisation
* Et RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* Quand je synchronise les organisations
* Alors l’organisation 1 existe et se nomme "Médiathèque"
* Et le bilan compte 1 création

### Scénario: Organisation dont le nom a changé

* Étant donné un compte RDV à synchroniser rattaché à l’organisation 1 nommée "Ancien nom"
* Et RDV Service Public renvoie l’organisation 1 nommée "Nouveau nom"
* Quand je synchronise les organisations
* Alors l’organisation 1 existe et se nomme "Nouveau nom"
* Et le bilan compte 1 mise à jour

### Scénario: Organisation inchangée

* Étant donné un compte RDV à synchroniser rattaché à l’organisation 1 nommée "Médiathèque"
* Et RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* Quand je synchronise les organisations
* Alors le bilan compte 1 organisation inchangée

## Règle: Les rattachements du compte suivent ce que renvoie l'API

### Scénario: Rattachement d'une nouvelle organisation

* Étant donné un compte RDV à synchroniser sans organisation
* Et RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* Quand je synchronise les organisations
* Alors le compte est rattaché à l’organisation 1

### Scénario: Détachement d'une organisation quittée

* Étant donné un compte RDV à synchroniser rattaché à l’organisation 1 nommée "Médiathèque"
* Et un rattachement résiduel à l’organisation 2
* Et RDV Service Public renvoie l’organisation 1 nommée "Médiathèque"
* Quand je synchronise les organisations
* Alors le compte n’est plus rattaché à l’organisation 2
* Et le compte est rattaché à l’organisation 1

## Règle: Un échec de l'API laisse la base intacte

### Scénario: RDV Service Public injoignable

* Étant donné un compte RDV à synchroniser sans organisation
* Et RDV Service Public refusera de lister les organisations
* Quand je synchronise les organisations
* Alors la synchronisation échoue avec l’erreur "ApiIndisponible"
* Et l’organisation 1 n’existe pas
