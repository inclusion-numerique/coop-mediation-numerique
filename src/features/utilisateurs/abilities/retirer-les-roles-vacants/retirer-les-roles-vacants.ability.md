# Fonctionnalité: Retirer les rôles vacants d'un double rôle

> Un double rôle inscrit depuis plus de 30 jours perd le rôle qu'il n'a
> jamais utilisé, dans le dispositif comme hors dispositif : le compte garde
> toujours au moins un rôle. Seul le rôle coordinateur d'un coordinateur du
> dispositif ne se retire pas, puisque la connexion le recréerait. Le retrait
> suit les règles du changement de rôles : un rôle qui a servi ne se retire
> pas, et les tags du rôle retiré passent au rôle qui reste.

## Règle: Le système repère les rôles restés vacants d'un double rôle

### Scénario: Le rôle coordinateur vacant est repéré

* Étant donné un médiateur coordinateur hors dispositif inscrit depuis 40 jours
* Et son rôle médiateur a déjà servi
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte est repéré comme vacant
* Et son rôle médiateur n'est pas repéré comme vacant

### Scénario: Le rôle vacant d'un conseiller numérique est aussi repéré

* Étant donné un médiateur coordinateur conseiller numérique inscrit depuis 40 jours
* Et son rôle médiateur a déjà servi
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte est repéré comme vacant

### Scénario: Le rôle coordinateur d'un coordinateur du dispositif est gardé

* Étant donné un coordinateur du dispositif médiateur inscrit depuis 40 jours
* Et son rôle médiateur a déjà servi
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte n'est pas repéré comme vacant

### Scénario: Un coordinateur déclaré sans affectation au dispositif perd son rôle vacant

* Étant donné un médiateur coordinateur déclaré coordinateur sans affectation au dispositif inscrit depuis 40 jours
* Et son rôle médiateur a déjà servi
* Quand le système cherche les rôles vacants
* Alors le rôle coordinateur de ce compte est repéré comme vacant

### Scénario: Un double rôle inscrit depuis moins de 30 jours garde ses rôles

* Étant donné un médiateur coordinateur hors dispositif inscrit depuis 10 jours
* Quand le système cherche les rôles vacants
* Alors aucun rôle de ce compte n'est repéré comme vacant
