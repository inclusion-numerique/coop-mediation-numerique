# Feature: Fusionner un tag

> Fusionner un tag rattache ses activités au tag de destination, puis le
> supprime. La destination a une portée au moins aussi large que la source :
> un tag ne se fond jamais dans un cercle plus étroit que le sien.

## Rule: Les activités du tag fusionné rejoignent la destination

### Scenario: Le médiateur fusionne son tag personnel dans un tag national

* Given un médiateur dont le tag personnel est utilisé dans une activité à fusionner
* And un tag national de destination
* When ce médiateur fusionne son tag dans le tag de destination
* Then la fusion du tag réussit
* And l'activité porte le tag de destination
* And le tag fusionné n'existe plus

### Scenario: Le coordinateur fusionne un tag d'équipe dans un tag de son département

* Given un coordinateur du 69 dont le tag d'équipe est utilisé dans une activité de coordination
* And un tag départemental du 69 de destination
* When ce coordinateur fusionne son tag dans le tag de destination
* Then la fusion du tag réussit
* And l'activité de coordination porte le tag de destination
* And le tag fusionné n'existe plus

## Rule: Un tag ne fusionne pas dans un cercle plus étroit

### Scenario: Le coordinateur ne fusionne pas un tag départemental dans son tag personnel

* Given un coordinateur du 69 dont le tag départemental est à fusionner
* And un tag personnel de ce coordinateur de destination
* When ce coordinateur fusionne son tag dans le tag de destination
* Then la fusion du tag est refusée
* And le tag à fusionner existe toujours

## Rule: Les destinations proposées sont celles que l'acteur peut voir

### Scenario: Le médiateur ne se voit proposer ni son tag source ni le tag d'un autre

* Given un médiateur dont le tag personnel est utilisé dans une activité à fusionner
* And un tag national de destination
* And un tag personnel d'un autre médiateur
* When ce médiateur cherche où fusionner son tag
* Then le tag de destination est proposé
* And ni le tag à fusionner ni le tag de l'autre médiateur ne sont proposés
