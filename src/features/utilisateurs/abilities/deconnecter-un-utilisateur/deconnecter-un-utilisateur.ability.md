# Fonctionnalité: Déconnecter un utilisateur

> L'administration ferme toutes les sessions d'un compte, par exemple après
> un changement de rôle, pour que la personne retrouve un état à jour.

## Règle: Toutes les sessions du compte sont fermées

### Scénario: Déconnecter un compte connecté

* Étant donné un compte à déconnecter avec 2 sessions ouvertes
* Quand l'administration déconnecte ce compte
* Alors 2 sessions sont fermées
* Et ce compte n'a plus aucune session

### Scénario: Déconnecter un compte sans session

* Étant donné un compte à déconnecter avec 0 sessions ouvertes
* Quand l'administration déconnecte ce compte
* Alors 0 sessions sont fermées

## Règle: On ne déconnecte que ce qui existe

### Scénario: Un compte inconnu n'est pas déconnecté

* Quand l'administration déconnecte un compte qui n'existe pas
* Alors la déconnexion échoue avec l'erreur "UtilisateurIntrouvable"
