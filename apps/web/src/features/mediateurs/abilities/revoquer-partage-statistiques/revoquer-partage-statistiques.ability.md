# Feature: Révoquer le partage de statistiques

## Rule: Les deux côtés du partage sont révoqués

> Un lien de partage est une URL publique. La laisser vivre après la suppression
> d'un compte, c'est laisser consultables les statistiques de quelqu'un qui
> n'est plus là.

### Scenario: Les partages du médiateur et du coordinateur sont révoqués

* Given un compte qui partage ses statistiques des deux côtés
* When je révoque le partage de statistiques de ce compte
* Then la révocation porte sur 2 partages
* And plus aucun partage de ce compte n'est actif

## Rule: Rejouer la révocation ne fait rien de plus

### Scenario: Une seconde révocation ne trouve plus rien

* Given un compte qui partage ses statistiques des deux côtés
* When je révoque le partage de statistiques de ce compte
* And je révoque à nouveau le partage de statistiques de ce compte
* Then la révocation porte sur 0 partage
