# Fonctionnalité: Effacer le texte libre des comptes rendus

## Règle: Le texte libre part, la ligne reste

> Les notes sont saisies à la main : c'est là que l'identité d'un bénéficiaire
> finit par se retrouver malgré les champs prévus pour elle. Les lignes portent
> l'historique statistique, elles ne bougent pas.

### Scénario: Les notes d'un médiateur et d'un coordinateur sont vidées

* Étant donné des comptes rendus porteurs de texte libre
* Quand j'efface le texte libre de ces comptes rendus
* Alors l'effacement porte sur 3 comptes rendus
* Et aucun compte rendu ne porte plus de texte libre
* Et les comptes rendus sont toujours en base

## Règle: Rejouer l'effacement ne fait rien de plus

### Scénario: Un second effacement ne trouve plus rien

* Étant donné des comptes rendus porteurs de texte libre
* Quand j'efface le texte libre de ces comptes rendus
* Et j'efface à nouveau le texte libre de ces comptes rendus
* Alors l'effacement porte sur 0 compte rendu
