# Feature: Déconnecter un utilisateur

> L'administration ferme toutes les sessions d'un compte, par exemple après
> un changement de rôle, pour que la personne retrouve un état à jour.

## Rule: Toutes les sessions du compte sont fermées

### Scenario: Déconnecter un compte connecté

* Given un compte à déconnecter avec 2 sessions ouvertes
* When l'administration déconnecte ce compte
* Then 2 sessions sont fermées
* And ce compte n'a plus aucune session

### Scenario: Déconnecter un compte sans session

* Given un compte à déconnecter avec 0 sessions ouvertes
* When l'administration déconnecte ce compte
* Then 0 sessions sont fermées

## Rule: On ne déconnecte que ce qui existe

### Scenario: Un compte inconnu n'est pas déconnecté

* When l'administration déconnecte un compte qui n'existe pas
* Then la déconnexion échoue avec l'erreur "UtilisateurIntrouvable"
