# Feature: Résoudre un lien de partage de statistiques

> N'importe quel internaute qui détient le lien consulte les statistiques
> partagées, sans être connecté : le lien désigne le compte dont on affiche
> les statistiques, et rien d'autre.

## Rule: Un lien actif désigne le compte qui partage

### Scenario: Le lien d'un médiateur désigne ce médiateur

* Given un médiateur qui partage ses statistiques
* When un internaute ouvre le lien de ce partage
* Then le lien désigne le médiateur de ce compte

### Scenario: Le lien d'un coordinateur désigne ce coordinateur

* Given un coordinateur qui partage ses statistiques
* When un internaute ouvre le lien de ce partage
* Then le lien désigne le coordinateur de ce compte

### Scenario: Le lien médiateur d'un compte qui a les deux rôles désigne le médiateur

* Given un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* When un internaute ouvre le lien du partage du médiateur
* Then le lien désigne le médiateur de ce compte

### Scenario: Le lien coordinateur d'un compte qui a les deux rôles désigne le coordinateur

* Given un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* When un internaute ouvre le lien du partage du coordinateur
* Then le lien désigne le coordinateur de ce compte

## Rule: Un lien qui ne désigne plus personne est introuvable

### Scenario: Un lien désactivé est introuvable

* Given un médiateur qui partage ses statistiques
* And ce partage est désactivé
* When un internaute ouvre le lien de ce partage
* Then le lien est introuvable

### Scenario: Le lien d'un compte supprimé est introuvable

> La suppression du compte révoque ses partages ; la résolution ne s'y fie
> pas pour autant.

* Given un médiateur qui partage ses statistiques
* And le compte de ce partage est supprimé
* When un internaute ouvre le lien de ce partage
* Then le lien est introuvable

### Scenario: Le lien d'un coordinateur dont le compte est supprimé est introuvable

* Given un coordinateur qui partage ses statistiques
* And le compte de ce partage est supprimé
* When un internaute ouvre le lien de ce partage
* Then le lien est introuvable

### Scenario: Un lien inconnu est introuvable

* When un internaute ouvre un lien de partage inconnu
* Then le lien est introuvable

### Scenario: Un lien malformé est introuvable

* When un internaute ouvre un lien de partage malformé
* Then le lien est introuvable
