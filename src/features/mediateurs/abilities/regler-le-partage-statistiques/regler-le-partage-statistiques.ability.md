# Fonctionnalité: Régler le partage de statistiques

> Le lien de partage est une URL publique : quiconque le détient consulte les
> statistiques partagées, avec leurs filtres et leurs exports. Un médiateur
> partage ses statistiques, un coordinateur celles de son équipe, ses propres
> activités incluses. Le compte active et désactive chaque partage à volonté.
> Réactiver un partage donne un nouveau lien : un lien désactivé ne redevient
> jamais valable.

## Règle: Le compte active le partage de ses statistiques

### Scénario: Un médiateur active le partage de ses statistiques

* Étant donné un médiateur qui ne partage pas ses statistiques
* Quand ce compte active le partage de ses statistiques
* Alors le partage du médiateur est actif

### Scénario: Un coordinateur active le partage de ses statistiques

* Étant donné un coordinateur qui ne partage pas ses statistiques
* Quand ce compte active le partage de ses statistiques
* Alors le partage du coordinateur est actif

### Scénario: Activer un partage déjà actif ne change pas le lien

* Étant donné un médiateur qui partage ses statistiques
* Quand ce compte active le partage de ses statistiques
* Alors le partage du médiateur est actif
* Et le lien du partage est resté le même

## Règle: Le compte désactive le partage de ses statistiques

### Scénario: Un médiateur désactive le partage de ses statistiques

* Étant donné un médiateur qui partage ses statistiques
* Quand ce compte désactive le partage de ses statistiques
* Alors le partage du médiateur est inactif

### Scénario: Désactiver un partage déjà inactif ne fait rien

* Étant donné un médiateur qui partage ses statistiques
* Et ce partage est désactivé
* Quand ce compte désactive le partage de ses statistiques
* Alors le partage du médiateur est inactif
* Et la date de désactivation du partage est restée la même

### Scénario: Désactiver sans avoir jamais partagé ne crée rien

* Étant donné un médiateur qui ne partage pas ses statistiques
* Quand ce compte désactive le partage de ses statistiques
* Alors ce compte n'a aucun partage

## Règle: Réactiver le partage donne un nouveau lien

> Désactiver un partage sert à couper un lien qui a trop circulé : le
> réactiver ne doit pas lui redonner accès.

### Scénario: Un médiateur réactive le partage de ses statistiques

* Étant donné un médiateur qui partage ses statistiques
* Et ce partage est désactivé
* Quand ce compte active le partage de ses statistiques
* Alors le partage du médiateur est actif
* Et le lien du partage a changé

## Règle: Un compte médiateur et coordinateur choisit ce qu'il partage

### Scénario: Il partage ses statistiques de médiateur

* Étant donné un compte médiateur et coordinateur qui ne partage pas ses statistiques
* Quand ce compte active le partage de ses statistiques
* Alors le partage du médiateur est actif
* Et le coordinateur n'a aucun partage

### Scénario: Il partage les statistiques de son équipe

* Étant donné un compte médiateur et coordinateur qui ne partage pas ses statistiques
* Quand ce compte active le partage des statistiques de son équipe
* Alors le partage du coordinateur est actif
* Et le médiateur n'a aucun partage

### Scénario: Il partage les deux

* Étant donné un compte médiateur et coordinateur qui ne partage pas ses statistiques
* Quand ce compte active le partage de ses statistiques
* Et ce compte active le partage des statistiques de son équipe
* Alors le partage du médiateur est actif
* Et le partage du coordinateur est actif

## Règle: Un compte ne partage que ce à quoi il est rattaché

### Scénario: Un médiateur ne peut pas partager les statistiques d'une équipe

* Étant donné un médiateur qui ne partage pas ses statistiques
* Quand ce compte active le partage des statistiques de son équipe
* Alors le réglage du partage échoue car le compte n'est pas rattaché à ce périmètre

## Règle: Seul un médiateur ou un coordinateur a des statistiques à partager

### Scénario: Un compte sans rôle ne peut pas partager

* Étant donné un compte qui n'est ni médiateur ni coordinateur
* Quand ce compte active le partage de ses statistiques
* Alors le réglage du partage échoue car le compte n'a pas de statistiques à partager
