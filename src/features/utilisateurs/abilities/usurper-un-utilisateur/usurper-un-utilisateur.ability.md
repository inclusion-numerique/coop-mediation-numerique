# Fonctionnalité: Usurper un utilisateur

> L'administration se connecte à la place d'un compte de test pour en
> parcourir les écrans. En production, seuls les comptes de test
> s'usurpent ; l'usurpation libre n'existe que sur les instances qui
> l'activent.

## Règle: L'usurpation remplace le compte de la session, et s'en souvient

### Scénario: Usurper un compte de test

* Étant donné un administrateur connecté et un compte de test à usurper
* Quand l'administrateur usurpe ce compte, usurpation limitée aux comptes de test
* Alors l'usurpation aboutit
* Et la session est celle du compte usurpé
* Et la session retient l'administrateur usurpateur

## Règle: Un compte réel ne s'usurpe que si l'instance le permet

### Scénario: Un compte réel ne s'usurpe pas en production

* Étant donné un administrateur connecté et un compte réel à usurper
* Quand l'administrateur usurpe ce compte, usurpation limitée aux comptes de test
* Alors l'usurpation échoue avec l'erreur "UsurpationHorsFixtures"

### Scénario: Un compte réel s'usurpe sur une instance qui le permet

* Étant donné un administrateur connecté et un compte réel à usurper
* Quand l'administrateur usurpe ce compte, usurpation ouverte à tous les comptes
* Alors l'usurpation aboutit
