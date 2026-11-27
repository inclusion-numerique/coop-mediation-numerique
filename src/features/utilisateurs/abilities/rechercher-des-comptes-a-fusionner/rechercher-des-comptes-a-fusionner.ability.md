# Fonctionnalité: Rechercher des comptes à fusionner

> Pour fusionner un compte en double dans celui qu'on garde, l'administration
> cherche le doublon par son nom ou son adresse.

## Règle: Le compte qu'on garde n'est jamais proposé

### Scénario: Trouver le compte en double par son adresse

* Étant donné un compte à garder et un compte en double
* Quand l'administration cherche le compte en double par son adresse
* Alors seul le compte en double est proposé

### Scénario: Chercher le compte qu'on garde ne le propose pas

* Étant donné un compte à garder et un compte en double
* Quand l'administration cherche le compte à garder par son adresse
* Alors aucun compte n'est proposé à la fusion
