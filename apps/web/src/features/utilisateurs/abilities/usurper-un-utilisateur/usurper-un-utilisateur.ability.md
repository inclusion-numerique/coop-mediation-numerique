# Feature: Usurper un utilisateur

> L'administration se connecte à la place d'un compte de test pour en
> parcourir les écrans. En production, seuls les comptes de test
> s'usurpent ; l'usurpation libre n'existe que sur les instances qui
> l'activent.

## Rule: L'usurpation remplace le compte de la session, et s'en souvient

### Scenario: Usurper un compte de test

* Given un administrateur connecté et un compte de test à usurper
* When l'administrateur usurpe ce compte, usurpation limitée aux comptes de test
* Then l'usurpation aboutit
* And la session est celle du compte usurpé
* And la session retient l'administrateur usurpateur

### Scenario: Terminer l'usurpation

* Given un administrateur connecté et un compte de test à usurper
* And l'administrateur usurpe ce compte, usurpation limitée aux comptes de test
* When l'administrateur termine l'usurpation
* Then la session est rendue à l'administrateur

## Rule: Un compte réel ne s'usurpe que si l'instance le permet

### Scenario: Un compte réel ne s'usurpe pas en production

* Given un administrateur connecté et un compte réel à usurper
* When l'administrateur usurpe ce compte, usurpation limitée aux comptes de test
* Then l'usurpation échoue avec l'erreur "UsurpationHorsFixtures"

### Scenario: Un compte réel s'usurpe sur une instance qui le permet

* Given un administrateur connecté et un compte réel à usurper
* When l'administrateur usurpe ce compte, usurpation ouverte à tous les comptes
* Then l'usurpation aboutit
