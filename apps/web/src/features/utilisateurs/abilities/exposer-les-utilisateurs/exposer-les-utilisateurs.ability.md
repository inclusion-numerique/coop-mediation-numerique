# Feature: Exposer les utilisateurs

> L'API v1 expose les comptes inscrits, ainsi que ceux qui, sans avoir fini
> leur inscription, ont déjà saisi au moins une activité.

## Rule: L'API expose les inscrits et ceux qui ont déjà produit

### Scenario: Un inscrit est exposé

* Given un compte inscrit à exposer
* When l'API liste les utilisateurs
* Then ce compte est exposé

### Scenario: Une inscription en cours sans activité n'est pas exposée

* Given une inscription en cours sans activité à exposer
* When l'API liste les utilisateurs
* Then ce compte n'est pas exposé

### Scenario: Une inscription en cours qui a saisi une activité est exposée

* Given une inscription en cours avec une activité à exposer
* When l'API liste les utilisateurs
* Then ce compte est exposé

## Rule: L'API peut écarter les comptes supprimés

### Scenario: Un compte supprimé est écarté sur demande

* Given un compte inscrit puis supprimé à exposer
* When l'API liste les utilisateurs non supprimés
* Then ce compte n'est pas exposé
