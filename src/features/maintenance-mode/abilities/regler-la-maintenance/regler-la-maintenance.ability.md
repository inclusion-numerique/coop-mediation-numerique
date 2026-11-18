# Feature: Régler le mode maintenance

> Pendant une opération sur les données, l'administration met la Coop en
> maintenance : les médiateurs et coordinateurs ne peuvent plus rien modifier,
> mais consultent toujours leurs données. Les administrateurs et le support
> gardent la main. Chaque maintenance est une période, ouverte à l'activation et
> close à la désactivation, que l'historique conserve.

## Rule: Activer ouvre une période, désactiver la clôt

### Scenario: Activer la maintenance ouvre une période

* Given aucune maintenance en cours
* When l'administration active la maintenance avec le message "Bascule de la base"
* Then la maintenance est active avec le message "Bascule de la base"

### Scenario: Activer une maintenance en cours change son message

* Given une maintenance en cours avec le message "Bascule de la base"
* When l'administration active la maintenance avec le message "Bascule prolongée"
* Then la maintenance est active avec le message "Bascule prolongée"
* And une seule maintenance est en cours

### Scenario: Désactiver la maintenance clôt la période en cours

* Given une maintenance en cours avec le message "Bascule de la base"
* When l'administration désactive la maintenance
* Then la maintenance est inactive
* And la dernière maintenance de l'historique est close

## Rule: Une maintenance sans message affiche le message par défaut

### Scenario: Activer sans message affiche le message par défaut

* Given aucune maintenance en cours
* When l'administration active la maintenance sans message
* Then la maintenance est active avec le message par défaut

## Rule: Pendant une maintenance, seuls les administrateurs et le support modifient

### Scenario: Un médiateur ne peut plus modifier pendant la maintenance

* Given une maintenance en cours avec le message "Bascule de la base"
* When un compte de rôle "User" tente une modification
* Then la modification est refusée avec le message "Bascule de la base"

### Scenario: Le support modifie pendant la maintenance

* Given une maintenance en cours avec le message "Bascule de la base"
* When un compte de rôle "Support" tente une modification
* Then la modification passe

### Scenario: Un médiateur modifie hors maintenance

* Given aucune maintenance en cours
* When un compte de rôle "User" tente une modification
* Then la modification passe
