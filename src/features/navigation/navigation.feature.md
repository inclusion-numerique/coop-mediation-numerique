# Feature: Navigation

> La coop est l'espace de travail des utilisateurs inscrits. Un compte
> d'administration n'y a pas sa place, et un utilisateur qui n'a pas achevé son
> inscription est renvoyé vers elle.

## Rule: La coop est réservée aux utilisateurs

### Scenario: Un administrateur n'entre pas dans la coop

* Given un compte "Admin" dont l'inscription est achevée
* When ce compte demande l'accès à la coop
* Then la coop lui est réservée aux utilisateurs, en tant que "Admin"

## Rule: Un utilisateur entre dans la coop une fois son inscription achevée

### Scenario: Un utilisateur dont l'inscription est inachevée est renvoyé vers elle

* Given un compte "User" dont l'inscription n'est pas achevée
* When ce compte demande l'accès à la coop
* Then la coop lui reste fermée tant que son inscription est inachevée

### Scenario: Un utilisateur inscrit entre dans la coop

* Given un compte "User" dont l'inscription est achevée
* When ce compte demande l'accès à la coop
* Then la coop lui est ouverte
