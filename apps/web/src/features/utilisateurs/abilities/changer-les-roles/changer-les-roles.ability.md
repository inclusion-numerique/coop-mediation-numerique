# Feature: Changer les rôles d'un utilisateur

> L'administration ajoute un rôle à tout moment. Elle ne retire un rôle que
> s'il n'a jamais servi : un médiateur sans bénéficiaire ni activité, un
> coordinateur sans équipe, sans invitation en attente ni activité de
> coordination. Les tags du rôle retiré passent au rôle qui reste.

## Rule: Un rôle s'ajoute librement

### Scenario: Ajouter le rôle coordinateur à un médiateur

* Given un médiateur dont on change les rôles
* When l'administration lui donne les rôles médiateur et coordinateur
* Then le changement de rôles aboutit
* And ce compte est médiateur et coordinateur

## Rule: Un rôle ne se retire que s'il n'a jamais servi

### Scenario: Retirer le rôle médiateur vierge d'un double rôle

* Given un médiateur coordinateur dont on change les rôles
* And son rôle médiateur porte un tag
* When l'administration ne lui laisse que le rôle coordinateur
* Then le changement de rôles aboutit
* And ce compte n'est plus que coordinateur
* And le tag appartient désormais à son rôle coordinateur

### Scenario: Le rôle médiateur qui a des activités ne se retire pas

* Given un médiateur coordinateur dont on change les rôles
* And son rôle médiateur a une activité
* When l'administration ne lui laisse que le rôle coordinateur
* Then le changement de rôles échoue avec l'erreur "RoleNonVierge"
* And ce compte est médiateur et coordinateur

### Scenario: Le rôle coordinateur qui a coordonné ne se retire pas

* Given un médiateur coordinateur dont on change les rôles
* And son rôle coordinateur a une activité de coordination
* When l'administration ne lui laisse que le rôle médiateur
* Then le changement de rôles échoue avec l'erreur "RoleNonVierge"
* And ce compte est médiateur et coordinateur

## Rule: Un compte garde au moins un rôle

### Scenario: Retirer tous les rôles est refusé

* Given un médiateur dont on change les rôles
* When l'administration lui retire tous ses rôles
* Then le changement de rôles échoue avec l'erreur "AucunRoleDemande"

## Rule: Les comptes administrateur et support ne se changent pas ici

### Scenario: Les rôles d'un administrateur ne changent pas

* Given un administrateur dont on change les rôles
* When l'administration lui donne les rôles médiateur et coordinateur
* Then le changement de rôles échoue avec l'erreur "RoleProtege"

## Rule: Le système retire les rôles restés vacants d'un double rôle

> Un double rôle inscrit depuis plus de 30 jours perd le rôle qu'il n'a
> jamais utilisé, dans le dispositif comme hors dispositif : le compte garde
> toujours au moins un rôle. Seul le rôle coordinateur d'un coordinateur du
> dispositif ne se retire pas, puisque la connexion le recréerait.

### Scenario: Le rôle coordinateur vacant est retiré

* Given un médiateur coordinateur hors dispositif inscrit depuis 40 jours
* And son rôle médiateur a une activité
* When le système cherche les rôles vacants
* Then le rôle coordinateur de ce compte est repéré comme vacant
* And son rôle médiateur n'est pas repéré comme vacant

### Scenario: Le rôle vacant d'un conseiller numérique est aussi retiré

* Given un médiateur coordinateur conseiller numérique inscrit depuis 40 jours
* And son rôle médiateur a une activité
* When le système cherche les rôles vacants
* Then le rôle coordinateur de ce compte est repéré comme vacant

### Scenario: Le rôle coordinateur d'un coordinateur du dispositif est gardé

* Given un coordinateur du dispositif médiateur inscrit depuis 40 jours
* And son rôle médiateur a une activité
* When le système cherche les rôles vacants
* Then le rôle coordinateur de ce compte n'est pas repéré comme vacant

### Scenario: Un coordinateur déclaré sans affectation au dispositif perd son rôle vacant

* Given un médiateur coordinateur déclaré coordinateur sans affectation au dispositif inscrit depuis 40 jours
* And son rôle médiateur a une activité
* When le système cherche les rôles vacants
* Then le rôle coordinateur de ce compte est repéré comme vacant

### Scenario: Un double rôle inscrit depuis moins de 30 jours garde ses rôles

* Given un médiateur coordinateur hors dispositif inscrit depuis 10 jours
* When le système cherche les rôles vacants
* Then aucun rôle de ce compte n'est repéré comme vacant
