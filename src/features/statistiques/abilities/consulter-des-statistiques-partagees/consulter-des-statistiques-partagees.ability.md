# Fonctionnalité: Consulter des statistiques partagées

> Une personne peut partager ses statistiques par un lien public. Le lien est
> créé depuis l'un de ses profils, médiateur ou coordinateur : celui qui ouvre
> le lien voit les statistiques de ce profil, et rien de plus. La résolution du
> lien lui-même est décrite par la spécification de la résolution d'un lien de
> partage.

## Règle: Le lien d'un médiateur ne montre que son activité de médiateur

### Scénario: Un médiateur qui coordonne aussi partage depuis son profil de médiateur

* Étant donné une personne à la fois médiatrice et coordinatrice
* Quand elle partage ses statistiques depuis son profil de "médiateur"
* Alors les statistiques partagées ne comprennent pas son équipe

## Règle: Le lien d'un coordinateur montre aussi l'activité de son équipe

### Scénario: Un coordinateur partage depuis son profil de coordinateur

* Étant donné une personne à la fois médiatrice et coordinatrice
* Quand elle partage ses statistiques depuis son profil de "coordinateur"
* Alors les statistiques partagées comprennent son équipe

## Règle: Le lien ne livre ni les emplois ni le compte de rendez-vous

### Scénario: Les emplois et le compte de rendez-vous restent privés

* Étant donné une personne à la fois médiatrice et coordinatrice
* Quand elle partage ses statistiques depuis son profil de "coordinateur"
* Alors les statistiques partagées ne livrent ni ses emplois ni son compte de rendez-vous
