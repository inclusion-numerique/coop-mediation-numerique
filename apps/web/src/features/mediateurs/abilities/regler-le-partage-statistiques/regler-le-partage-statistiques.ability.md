# Feature: Régler le partage de statistiques

> Le lien de partage est une URL publique : quiconque le détient consulte les
> statistiques du compte, avec ses filtres et ses exports. Le compte l'active
> et le désactive à volonté, et retrouve le même lien en le réactivant.

## Rule: Le compte active le partage de ses statistiques

### Scenario: Un médiateur active le partage de ses statistiques

* Given un médiateur qui ne partage pas ses statistiques
* When ce compte active le partage de ses statistiques
* Then le partage du médiateur est actif

### Scenario: Un coordinateur active le partage de ses statistiques

* Given un coordinateur qui ne partage pas ses statistiques
* When ce compte active le partage de ses statistiques
* Then le partage du coordinateur est actif

### Scenario: Activer un partage déjà actif ne change pas le lien

* Given un médiateur qui partage ses statistiques
* When ce compte active le partage de ses statistiques
* Then le partage du médiateur est actif
* And le lien du partage est resté le même

## Rule: Le compte désactive le partage de ses statistiques

### Scenario: Un médiateur désactive le partage de ses statistiques

* Given un médiateur qui partage ses statistiques
* When ce compte désactive le partage de ses statistiques
* Then le partage du médiateur est inactif

### Scenario: Désactiver un partage déjà inactif ne fait rien

* Given un médiateur qui partage ses statistiques
* And ce partage est désactivé
* When ce compte désactive le partage de ses statistiques
* Then le partage du médiateur est inactif
* And la date de désactivation du partage est restée la même

### Scenario: Désactiver sans avoir jamais partagé ne crée rien

* Given un médiateur qui ne partage pas ses statistiques
* When ce compte désactive le partage de ses statistiques
* Then ce compte n'a aucun partage

## Rule: Réactiver le partage redonne le même lien

> Le lien déjà diffusé redevient valable : le compte n'a pas à le
> redistribuer.

### Scenario: Un médiateur réactive le partage de ses statistiques

* Given un médiateur qui partage ses statistiques
* And ce partage est désactivé
* When ce compte active le partage de ses statistiques
* Then le partage du médiateur est actif
* And le lien du partage est resté le même

## Rule: Un compte médiateur et coordinateur partage ses statistiques de médiateur

### Scenario: Le partage activé est celui du médiateur

* Given un compte médiateur et coordinateur qui ne partage pas ses statistiques
* When ce compte active le partage de ses statistiques
* Then le partage du médiateur est actif
* And le coordinateur n'a aucun partage

## Rule: Seul un médiateur ou un coordinateur a des statistiques à partager

### Scenario: Un compte sans rôle ne peut pas partager

* Given un compte qui n'est ni médiateur ni coordinateur
* When ce compte active le partage de ses statistiques
* Then le réglage du partage échoue car le compte n'a pas de statistiques à partager
