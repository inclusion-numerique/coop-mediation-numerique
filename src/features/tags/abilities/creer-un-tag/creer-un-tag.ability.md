# Fonctionnalité: Créer un tag

> Un tag naît avec la visibilité choisie par son créateur : pour lui seul,
> pour une de ses équipes, ou, pour un coordinateur, pour tout son
> département.

## Règle: Le tag prend la visibilité choisie

### Scénario: Le médiateur crée un tag personnel

* Étant donné un médiateur qui veut créer un tag
* Quand il crée le tag "Ateliers seniors" visible par lui seul
* Alors la création du tag réussit
* Et le tag "Ateliers seniors" est un tag personnel de ce médiateur

### Scénario: Le médiateur crée un tag pour son équipe

* Étant donné un médiateur coordonné qui veut créer un tag
* Quand il crée le tag "Permanence mairie" visible par son équipe
* Alors la création du tag réussit
* Et le tag "Permanence mairie" est un tag de l'équipe de son coordinateur

### Scénario: Le coordinateur crée un tag pour son département

* Étant donné un coordinateur du département 69 qui veut créer un tag
* Quand il crée le tag "France services" visible par son département
* Alors la création du tag réussit
* Et le tag "France services" est un tag départemental du 69

## Règle: Personne ne crée un tag pour un cercle auquel il n'appartient pas

### Scénario: Le médiateur ne crée pas de tag pour une équipe dont il n'est pas membre

* Étant donné un médiateur qui veut créer un tag
* Quand il crée le tag "Intrus" visible par une autre équipe
* Alors la création du tag est refusée

### Scénario: Le médiateur ne crée pas de tag départemental

* Étant donné un médiateur qui veut créer un tag
* Quand il crée le tag "Intrus" visible par son département
* Alors la création du tag est refusée
