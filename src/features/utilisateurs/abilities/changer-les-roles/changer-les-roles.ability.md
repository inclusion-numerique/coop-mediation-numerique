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

## Règle: Le système retire les rôles restés vacants d'un double rôle

> Un double rôle inscrit depuis plus de 30 jours perd le rôle qu'il n'a
> jamais utilisé, dans le dispositif comme hors dispositif : le compte garde
> toujours au moins un rôle. Seul le rôle coordinateur d'un coordinateur du
> dispositif ne se retire pas, puisque la connexion le recréerait.

### Scénario: Le rôle coordinateur vacant est retiré

* Étant donné un médiateur coordinateur hors dispositif inscrit depuis 40 jours
* Et son rôle médiateur a une activité
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte est repéré comme vacant
* Et son rôle médiateur n'est pas repéré comme vacant

### Scénario: Le rôle vacant d'un conseiller numérique est aussi retiré

* Étant donné un médiateur coordinateur conseiller numérique inscrit depuis 40 jours
* Et son rôle médiateur a une activité
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte est repéré comme vacant

### Scénario: Le rôle coordinateur d'un coordinateur du dispositif est gardé

* Étant donné un coordinateur du dispositif médiateur inscrit depuis 40 jours
* Et son rôle médiateur a une activité
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte n'est pas repéré comme vacant

### Scénario: Un coordinateur déclaré sans affectation au dispositif perd son rôle vacant

* Étant donné un médiateur coordinateur déclaré coordinateur sans affectation au dispositif inscrit depuis 40 jours
* Et son rôle médiateur a une activité
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte est repéré comme vacant

### Scénario: Un double rôle inscrit depuis moins de 30 jours garde ses rôles

* Étant donné un médiateur coordinateur hors dispositif inscrit depuis 10 jours
* Quand le système cherche les rôles vacants
* Alors aucun rôle de ce compte n'est repéré comme vacant
