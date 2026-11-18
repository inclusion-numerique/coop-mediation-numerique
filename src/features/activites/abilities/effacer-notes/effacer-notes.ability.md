# Feature: Effacer le texte libre des comptes rendus

## Rule: Le texte libre part, la ligne reste

> Les notes sont saisies à la main : c'est là que l'identité d'un bénéficiaire
> finit par se retrouver malgré les champs prévus pour elle. Les lignes portent
> l'historique statistique, elles ne bougent pas.

### Scenario: Les notes d'un médiateur et d'un coordinateur sont vidées

* Given des comptes rendus porteurs de texte libre
* When j'efface le texte libre de ces comptes rendus
* Then l'effacement porte sur 3 comptes rendus
* And aucun compte rendu ne porte plus de texte libre
* And les comptes rendus sont toujours en base

## Rule: Rejouer l'effacement ne fait rien de plus

### Scenario: Un second effacement ne trouve plus rien

* Given des comptes rendus porteurs de texte libre
* When j'efface le texte libre de ces comptes rendus
* And j'efface à nouveau le texte libre de ces comptes rendus
* Then l'effacement porte sur 0 compte rendu
