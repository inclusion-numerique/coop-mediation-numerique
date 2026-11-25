# Fonctionnalité: Révoquer le partage de statistiques

## Règle: Les deux côtés du partage sont révoqués

> Un lien de partage est une URL publique. La laisser vivre après la suppression
> d'un compte, c'est laisser consultables les statistiques de quelqu'un qui
> n'est plus là.

### Scénario: Les partages du médiateur et du coordinateur sont révoqués

* Étant donné un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* Quand je révoque le partage de statistiques de ce compte
* Alors la révocation porte sur 2 partages
* Et plus aucun partage de ce compte n'est actif

## Règle: Rejouer la révocation ne fait rien de plus

### Scénario: Une seconde révocation ne trouve plus rien

* Étant donné un compte médiateur et coordinateur qui partage ses statistiques des deux côtés
* Quand je révoque le partage de statistiques de ce compte
* Et je révoque à nouveau le partage de statistiques de ce compte
* Alors la révocation porte sur 0 partage
