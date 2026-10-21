# Feature: Régler le partage de statistiques

> Le lien de partage est une URL publique : quiconque le détient consulte les
> statistiques partagées, avec leurs filtres et leurs exports. Un médiateur
> partage ses statistiques, un coordinateur celles de son équipe, ses propres
> activités incluses. Le compte active et désactive chaque partage à volonté,
> et retrouve le même lien en le réactivant.

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

## Rule: Un compte médiateur et coordinateur choisit ce qu'il partage

### Scenario: Il partage ses statistiques de médiateur

* Given un compte médiateur et coordinateur qui ne partage pas ses statistiques
* When ce compte active le partage de ses statistiques
* Then le partage du médiateur est actif
* And le coordinateur n'a aucun partage

### Scenario: Il partage les statistiques de son équipe

* Given un compte médiateur et coordinateur qui ne partage pas ses statistiques
* When ce compte active le partage des statistiques de son équipe
* Then le partage du coordinateur est actif
* And le médiateur n'a aucun partage

### Scenario: Il partage les deux

* Given un compte médiateur et coordinateur qui ne partage pas ses statistiques
* When ce compte active le partage de ses statistiques
* And ce compte active le partage des statistiques de son équipe
* Then le partage du médiateur est actif
* And le partage du coordinateur est actif

## Rule: Un compte ne partage que ce à quoi il est rattaché

### Scenario: Un médiateur ne peut pas partager les statistiques d'une équipe

* Given un médiateur qui ne partage pas ses statistiques
* When ce compte active le partage des statistiques de son équipe
* Then le réglage du partage échoue car le compte n'est pas rattaché à ce périmètre

## Rule: Seul un médiateur ou un coordinateur a des statistiques à partager

### Scenario: Un compte sans rôle ne peut pas partager

* Given un compte qui n'est ni médiateur ni coordinateur
* When ce compte active le partage de ses statistiques
* Then le réglage du partage échoue car le compte n'a pas de statistiques à partager
