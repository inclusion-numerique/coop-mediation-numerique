# Feature: Mesurer l'usage des tags

> L'administration suit l'adoption des tags : combien de médiateurs en ont créé
> qui servent dans un compte rendu, combien de comptes rendus en portent, et
> quels tags reviennent le plus.

## Rule: Un tag compte dès qu'il sert dans un compte rendu

### Scenario: Le créateur d'un tag utilisé compte parmi les créateurs

* Given la mesure de l'usage des tags
* And un médiateur qui a utilisé son tag dans un compte rendu
* When l'administration mesure à nouveau l'usage des tags
* Then les créateurs de tags utilisés sont 1 de plus
* And les comptes rendus portant un tag sont 1 de plus
