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

> Un double rôle hors dispositif, inscrit depuis plus de 30 jours, perd le
> rôle qu'il n'a jamais utilisé.

### Scenario: Le rôle coordinateur vacant est retiré

* Given un médiateur coordinateur hors dispositif inscrit depuis 40 jours
* And son rôle médiateur a une activité
* When le système cherche les rôles vacants
* Then le rôle coordinateur de ce compte est repéré comme vacant
* And son rôle médiateur n'est pas repéré comme vacant
