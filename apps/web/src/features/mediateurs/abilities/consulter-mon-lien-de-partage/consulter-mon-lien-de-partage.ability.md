# Feature: Consulter mon lien de partage de statistiques

> Le lien n'existe que tant que le partage est actif : un lien désactivé ne
> donne plus rien à copier.

## Rule: Le compte retrouve son lien tant que le partage est actif

### Scenario: Un médiateur qui partage ses statistiques retrouve son lien

* Given un médiateur qui partage ses statistiques
* When ce compte consulte son lien de partage
* Then le lien consulté est celui du partage

### Scenario: Un coordinateur qui partage ses statistiques retrouve son lien

* Given un coordinateur qui partage ses statistiques
* When ce compte consulte son lien de partage
* Then le lien consulté est celui du partage

### Scenario: Un partage désactivé ne donne plus de lien

* Given un médiateur qui partage ses statistiques
* And ce partage est désactivé
* When ce compte consulte son lien de partage
* Then aucun lien n'est consulté

### Scenario: Un compte qui n'a jamais partagé n'a pas de lien

* Given un médiateur qui ne partage pas ses statistiques
* When ce compte consulte son lien de partage
* Then aucun lien n'est consulté

### Scenario: Un compte sans rôle n'a pas de lien

* Given un compte qui n'est ni médiateur ni coordinateur
* When ce compte consulte son lien de partage
* Then aucun lien n'est consulté

## Rule: Un compte médiateur et coordinateur partage ses statistiques de médiateur

### Scenario: Le lien consulté est celui du médiateur

* Given un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* When ce compte consulte son lien de partage
* Then le lien consulté est celui du partage du médiateur
