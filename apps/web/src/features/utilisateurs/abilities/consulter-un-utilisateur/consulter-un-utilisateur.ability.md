# Feature: Consulter un utilisateur

> La fiche d'administration d'un compte : son identité, ses rôles, son statut
> et la trace de ses connexions.

## Rule: La fiche ne divulgue jamais les secrets de connexion

> Les jetons OAuth et les jetons de session permettent de se faire passer pour
> la personne : la fiche n'en montre que le fournisseur et l'identifiant.

### Scenario: La fiche montre la liaison sans ses jetons

* Given un compte médiateur à consulter
* When l'administration consulte la fiche de ce compte
* Then la fiche montre la liaison au fournisseur "proconnect"
* And la fiche ne contient aucun jeton de connexion

## Rule: La fiche affiche le statut calculé par la règle commune

### Scenario: Un médiateur qui vient de saisir une activité est actif

* Given un compte médiateur à consulter
* And ce compte a saisi une activité aujourd'hui
* When l'administration consulte la fiche de ce compte
* Then la fiche affiche le statut "Actif"

## Rule: Une fiche introuvable n'est pas une erreur

### Scenario: Un identifiant inconnu ne donne aucune fiche

* When l'administration consulte la fiche d'un compte qui n'existe pas
* Then aucune fiche d'utilisateur n'est trouvée

### Scenario: Un identifiant mal formé ne donne aucune fiche

* When l'administration consulte la fiche "pas-un-identifiant"
* Then aucune fiche d'utilisateur n'est trouvée
