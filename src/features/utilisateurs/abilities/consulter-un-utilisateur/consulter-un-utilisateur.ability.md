# Fonctionnalité: Consulter un utilisateur

> La fiche d'administration d'un compte : son identité, ses rôles, son statut
> et la trace de ses connexions.

## Règle: La fiche ne divulgue jamais les secrets de connexion

> Les jetons OAuth et les jetons de session permettent de se faire passer pour
> la personne : la fiche n'en montre que le fournisseur et l'identifiant.

### Scénario: La fiche montre la liaison sans ses jetons

* Étant donné un compte médiateur à consulter
* Quand l'administration consulte la fiche de ce compte
* Alors la fiche montre la liaison au fournisseur "proconnect"
* Et la fiche ne contient aucun jeton de connexion

## Règle: La fiche affiche le statut calculé par la règle commune

### Scénario: Un médiateur qui vient de saisir une activité est actif

* Étant donné un compte médiateur à consulter
* Et ce compte a saisi une activité aujourd'hui
* Quand l'administration consulte la fiche de ce compte
* Alors la fiche affiche le statut "Actif"

## Règle: Une fiche introuvable n'est pas une erreur

### Scénario: Un identifiant inconnu ne donne aucune fiche

* Quand l'administration consulte la fiche d'un compte qui n'existe pas
* Alors aucune fiche d'utilisateur n'est trouvée

### Scénario: Un identifiant mal formé ne donne aucune fiche

* Quand l'administration consulte la fiche "pas-un-identifiant"
* Alors aucune fiche d'utilisateur n'est trouvée
