# Fonctionnalité: Résoudre un lien de partage de statistiques

> N'importe quel internaute qui détient le lien consulte les statistiques
> partagées, sans être connecté : le lien désigne le compte dont on affiche
> les statistiques, et rien d'autre.

## Règle: Un lien actif désigne le compte qui partage

### Scénario: Le lien d'un médiateur désigne ce médiateur

* Étant donné un médiateur qui partage ses statistiques
* Quand un internaute ouvre le lien de ce partage
* Alors le lien désigne le médiateur de ce compte

### Scénario: Le lien d'un coordinateur désigne ce coordinateur

* Étant donné un coordinateur qui partage ses statistiques
* Quand un internaute ouvre le lien de ce partage
* Alors le lien désigne le coordinateur de ce compte

### Scénario: Le lien médiateur d'un compte qui a les deux rôles désigne le médiateur

* Étant donné un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* Quand un internaute ouvre le lien du partage du médiateur
* Alors le lien désigne le médiateur de ce compte

### Scénario: Le lien coordinateur d'un compte qui a les deux rôles désigne le coordinateur

* Étant donné un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* Quand un internaute ouvre le lien du partage du coordinateur
* Alors le lien désigne le coordinateur de ce compte

## Règle: Un lien qui ne désigne plus personne est introuvable

### Scénario: Un lien désactivé est introuvable

* Étant donné un médiateur qui partage ses statistiques
* Et ce partage est désactivé
* Quand un internaute ouvre le lien de ce partage
* Alors le lien est introuvable

### Scénario: Le lien d'un compte supprimé est introuvable

> La suppression du compte révoque ses partages ; la résolution ne s'y fie
> pas pour autant.

* Étant donné un médiateur qui partage ses statistiques
* Et le compte de ce partage est supprimé
* Quand un internaute ouvre le lien de ce partage
* Alors le lien est introuvable

### Scénario: Le lien d'un coordinateur dont le compte est supprimé est introuvable

* Étant donné un coordinateur qui partage ses statistiques
* Et le compte de ce partage est supprimé
* Quand un internaute ouvre le lien de ce partage
* Alors le lien est introuvable

### Scénario: Un lien inconnu est introuvable

* Quand un internaute ouvre un lien de partage inconnu
* Alors le lien est introuvable

### Scénario: Un lien malformé est introuvable

* Quand un internaute ouvre un lien de partage malformé
* Alors le lien est introuvable
