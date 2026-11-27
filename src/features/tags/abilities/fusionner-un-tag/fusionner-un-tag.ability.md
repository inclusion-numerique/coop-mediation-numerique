# Fonctionnalité: Fusionner un tag

> Fusionner un tag rattache ses activités au tag de destination, puis le
> supprime. La destination a une portée au moins aussi large que la source :
> un tag ne se fond jamais dans un cercle plus étroit que le sien.

## Règle: Les activités du tag fusionné rejoignent la destination

### Scénario: Le médiateur fusionne son tag personnel dans un tag national

* Étant donné un médiateur dont le tag personnel est utilisé dans une activité à fusionner
* Et un tag national de destination
* Quand ce médiateur fusionne son tag dans le tag de destination
* Alors la fusion du tag réussit
* Et l'activité porte le tag de destination
* Et le tag fusionné n'existe plus

### Scénario: Le coordinateur fusionne un tag d'équipe dans un tag de son département

* Étant donné un coordinateur du 69 dont le tag d'équipe est utilisé dans une activité de coordination
* Et un tag départemental du 69 de destination
* Quand ce coordinateur fusionne son tag dans le tag de destination
* Alors la fusion du tag réussit
* Et l'activité de coordination porte le tag de destination
* Et le tag fusionné n'existe plus

## Règle: Un tag ne fusionne pas dans un cercle plus étroit

### Scénario: Le coordinateur ne fusionne pas un tag départemental dans son tag personnel

* Étant donné un coordinateur du 69 dont le tag départemental est à fusionner
* Et un tag personnel de ce coordinateur de destination
* Quand ce coordinateur fusionne son tag dans le tag de destination
* Alors la fusion du tag est refusée
* Et le tag à fusionner existe toujours
