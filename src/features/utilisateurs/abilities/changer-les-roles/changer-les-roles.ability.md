# Fonctionnalité: Changer les rôles d'un utilisateur

> L'administration ajoute un rôle à tout moment. Elle ne retire un rôle que
> s'il n'a jamais servi : un médiateur sans bénéficiaire ni activité, un
> coordinateur sans équipe, sans invitation en attente ni activité de
> coordination. Les tags du rôle retiré passent au rôle qui reste.

## Règle: Un rôle s'ajoute librement

### Scénario: Ajouter le rôle coordinateur à un médiateur

* Étant donné un médiateur dont on change les rôles
* Quand l'administration lui donne les rôles médiateur et coordinateur
* Alors le changement de rôles aboutit
* Et ce compte est médiateur et coordinateur

## Règle: Un rôle ne se retire que s'il n'a jamais servi

### Scénario: Retirer le rôle médiateur vierge d'un double rôle

* Étant donné un médiateur coordinateur dont on change les rôles
* Et son rôle médiateur porte un tag
* Quand l'administration ne lui laisse que le rôle coordinateur
* Alors le changement de rôles aboutit
* Et ce compte n'est plus que coordinateur
* Et le tag appartient désormais à son rôle coordinateur

### Scénario: Le rôle médiateur qui a des activités ne se retire pas

* Étant donné un médiateur coordinateur dont on change les rôles
* Et son rôle médiateur a une activité
* Quand l'administration ne lui laisse que le rôle coordinateur
* Alors le changement de rôles échoue avec l'erreur "RoleNonVierge"
* Et ce compte est médiateur et coordinateur

### Scénario: Le rôle coordinateur qui a coordonné ne se retire pas

* Étant donné un médiateur coordinateur dont on change les rôles
* Et son rôle coordinateur a une activité de coordination
* Quand l'administration ne lui laisse que le rôle médiateur
* Alors le changement de rôles échoue avec l'erreur "RoleNonVierge"
* Et ce compte est médiateur et coordinateur

## Règle: Un compte garde au moins un rôle

### Scénario: Retirer tous les rôles est refusé

* Étant donné un médiateur dont on change les rôles
* Quand l'administration lui retire tous ses rôles
* Alors le changement de rôles échoue avec l'erreur "AucunRoleDemande"

## Règle: Les comptes administrateur ne se changent pas ici

### Scénario: Les rôles d'un administrateur ne changent pas

* Étant donné un administrateur dont on change les rôles
* Quand l'administration lui donne les rôles médiateur et coordinateur
* Alors le changement de rôles échoue avec l'erreur "RoleProtege"
