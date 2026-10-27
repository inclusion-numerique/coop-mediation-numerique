# Feature: Mesurer l'usage des tags

> L'administration suit l'adoption des tags : combien de médiateurs en ont créé
> qui servent dans une activité, combien d'activités en portent, et
> quels tags reviennent le plus.

## Rule: Un tag compte dès qu'il sert dans une activité

### Scenario: Le créateur d'un tag utilisé compte parmi les créateurs

* Given la mesure de l'usage des tags
* And un médiateur qui a utilisé son tag dans une activité
* When l'administration mesure à nouveau l'usage des tags
* Then les créateurs de tags utilisés sont 1 de plus
* And les activités portant un tag sont 1 de plus
