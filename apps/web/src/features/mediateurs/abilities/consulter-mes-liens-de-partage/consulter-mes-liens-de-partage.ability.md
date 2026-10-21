# Feature: Consulter mes liens de partage de statistiques

> Un médiateur partage ses statistiques, un coordinateur celles de son équipe,
> ses propres activités incluses. Un compte qui a les deux rôles peut partager
> l'un, l'autre ou les deux : il retrouve un lien par périmètre. Un lien
> n'existe que tant que son partage est actif.

## Rule: Le compte retrouve le lien de chaque périmètre qu'il partage

### Scenario: Un médiateur qui partage ses statistiques retrouve son lien

* Given un médiateur qui partage ses statistiques
* When ce compte consulte ses liens de partage
* Then le lien du périmètre médiateur est celui de son partage

### Scenario: Un coordinateur qui partage ses statistiques retrouve son lien

* Given un coordinateur qui partage ses statistiques
* When ce compte consulte ses liens de partage
* Then le lien du périmètre coordinateur est celui de son partage

### Scenario: Un compte médiateur et coordinateur retrouve ses deux liens

* Given un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* When ce compte consulte ses liens de partage
* Then le lien du périmètre médiateur est celui de son partage
* And le lien du périmètre coordinateur est celui de son partage

## Rule: Un périmètre sans partage actif n'a pas de lien

### Scenario: Un partage désactivé ne donne plus de lien

* Given un médiateur qui partage ses statistiques
* And ce partage est désactivé
* When ce compte consulte ses liens de partage
* Then le périmètre médiateur n'a pas de lien

### Scenario: Un compte qui n'a jamais partagé n'a pas de lien

* Given un médiateur qui ne partage pas ses statistiques
* When ce compte consulte ses liens de partage
* Then le périmètre médiateur n'a pas de lien

### Scenario: Un compte médiateur et coordinateur peut partager chacun de ses périmètres

* Given un compte médiateur et coordinateur qui ne partage pas ses statistiques
* When ce compte consulte ses liens de partage
* Then le périmètre médiateur n'a pas de lien
* And le périmètre coordinateur n'a pas de lien

## Rule: Un compte sans rôle n'a rien à partager

### Scenario: Un compte sans rôle n'a aucun périmètre

* Given un compte qui n'est ni médiateur ni coordinateur
* When ce compte consulte ses liens de partage
* Then aucun périmètre de partage n'est proposé
