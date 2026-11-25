# Fonctionnalité: Exposer les utilisateurs

> L'API v1 expose les comptes inscrits, ainsi que ceux qui, sans avoir fini
> leur inscription, ont déjà saisi au moins une activité.

## Règle: L'API expose les inscrits et ceux qui ont déjà produit

### Scénario: Un inscrit est exposé

* Étant donné un compte inscrit à exposer
* Quand l'API liste les utilisateurs
* Alors ce compte est exposé

### Scénario: Une inscription en cours sans activité n'est pas exposée

* Étant donné une inscription en cours sans activité à exposer
* Quand l'API liste les utilisateurs
* Alors ce compte n'est pas exposé

### Scénario: Une inscription en cours qui a saisi une activité est exposée

* Étant donné une inscription en cours avec une activité à exposer
* Quand l'API liste les utilisateurs
* Alors ce compte est exposé

## Règle: L'API peut écarter les comptes supprimés

### Scénario: Un compte supprimé est écarté sur demande

* Étant donné un compte inscrit puis supprimé à exposer
* Quand l'API liste les utilisateurs non supprimés
* Alors ce compte n'est pas exposé
