# Feature: Créer un tag

> Un tag naît avec la visibilité choisie par son créateur : pour lui seul,
> pour une de ses équipes, ou, pour un coordinateur, pour tout son
> département.

## Rule: Le tag prend la visibilité choisie

### Scenario: Le médiateur crée un tag personnel

* Given un médiateur qui veut créer un tag
* When il crée le tag "Ateliers seniors" visible par lui seul
* Then la création du tag réussit
* And le tag "Ateliers seniors" est un tag personnel de ce médiateur

### Scenario: Le médiateur crée un tag pour son équipe

* Given un médiateur coordonné qui veut créer un tag
* When il crée le tag "Permanence mairie" visible par son équipe
* Then la création du tag réussit
* And le tag "Permanence mairie" est un tag de l'équipe de son coordinateur

### Scenario: Le coordinateur crée un tag pour son département

* Given un coordinateur du département 69 qui veut créer un tag
* When il crée le tag "France services" visible par son département
* Then la création du tag réussit
* And le tag "France services" est un tag départemental du 69

## Rule: Personne ne crée un tag pour un cercle auquel il n'appartient pas

### Scenario: Le médiateur ne crée pas de tag pour une équipe dont il n'est pas membre

* Given un médiateur qui veut créer un tag
* When il crée le tag "Intrus" visible par une autre équipe
* Then la création du tag est refusée

### Scenario: Le médiateur ne crée pas de tag départemental

* Given un médiateur qui veut créer un tag
* When il crée le tag "Intrus" visible par son département
* Then la création du tag est refusée
