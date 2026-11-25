# Fonctionnalité: Consulter mes liens de partage de statistiques

> Un médiateur partage ses statistiques, un coordinateur celles de son équipe,
> ses propres activités incluses. Un compte qui a les deux rôles peut partager
> l'un, l'autre ou les deux : il retrouve un lien par périmètre. Un lien
> n'existe que tant que son partage est actif.

## Règle: Le compte retrouve le lien de chaque périmètre qu'il partage

### Scénario: Un médiateur qui partage ses statistiques retrouve son lien

* Étant donné un médiateur qui partage ses statistiques
* Quand ce compte consulte ses liens de partage
* Alors le lien du périmètre médiateur est celui de son partage

### Scénario: Un coordinateur qui partage ses statistiques retrouve son lien

* Étant donné un coordinateur qui partage ses statistiques
* Quand ce compte consulte ses liens de partage
* Alors le lien du périmètre coordinateur est celui de son partage

### Scénario: Un compte médiateur et coordinateur retrouve ses deux liens

* Étant donné un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* Quand ce compte consulte ses liens de partage
* Alors le lien du périmètre médiateur est celui de son partage
* Et le lien du périmètre coordinateur est celui de son partage

## Règle: Un périmètre sans partage actif n'a pas de lien

### Scénario: Un partage désactivé ne donne plus de lien

* Étant donné un médiateur qui partage ses statistiques
* Et ce partage est désactivé
* Quand ce compte consulte ses liens de partage
* Alors le périmètre médiateur n'a pas de lien

### Scénario: Un compte qui n'a jamais partagé n'a pas de lien

* Étant donné un médiateur qui ne partage pas ses statistiques
* Quand ce compte consulte ses liens de partage
* Alors le périmètre médiateur n'a pas de lien

### Scénario: Un compte médiateur et coordinateur peut partager chacun de ses périmètres

* Étant donné un compte médiateur et coordinateur qui ne partage pas ses statistiques
* Quand ce compte consulte ses liens de partage
* Alors le périmètre médiateur n'a pas de lien
* Et le périmètre coordinateur n'a pas de lien

## Règle: Un compte sans rôle n'a rien à partager

### Scénario: Un compte sans rôle n'a aucun périmètre

* Étant donné un compte qui n'est ni médiateur ni coordinateur
* Quand ce compte consulte ses liens de partage
* Alors aucun périmètre de partage n'est proposé
