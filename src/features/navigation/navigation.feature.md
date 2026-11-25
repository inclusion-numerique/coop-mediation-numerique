# Fonctionnalité: Navigation

> La coop est l'espace de travail des utilisateurs inscrits. Un compte
> d'administration n'y a pas sa place, et un utilisateur qui n'a pas achevé son
> inscription est renvoyé vers elle.

## Règle: La coop est réservée aux utilisateurs

### Scénario: Un administrateur n'entre pas dans la coop

* Étant donné un compte "Admin" dont l'inscription est achevée
* Quand ce compte demande l'accès à la coop
* Alors la coop lui est réservée aux utilisateurs, en tant que "Admin"

## Règle: Un utilisateur entre dans la coop une fois son inscription achevée

### Scénario: Un utilisateur dont l'inscription est inachevée est renvoyé vers elle

* Étant donné un compte "User" dont l'inscription n'est pas achevée
* Quand ce compte demande l'accès à la coop
* Alors la coop lui reste fermée tant que son inscription est inachevée

### Scénario: Un utilisateur inscrit entre dans la coop

* Étant donné un compte "User" dont l'inscription est achevée
* Quand ce compte demande l'accès à la coop
* Alors la coop lui est ouverte
