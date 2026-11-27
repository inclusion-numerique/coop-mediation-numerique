# Fonctionnalité: Rechercher où fusionner un tag

> Avant de fusionner un tag, l'acteur cherche la destination parmi les tags
> qu'il voit. Ne sont proposés que les tags vers lesquels il peut fusionner :
> une portée au moins aussi large que celle de la source, jamais la source
> elle-même, et rien pour une source qu'il ne gère pas.

## Règle: Les destinations proposées sont celles que l'acteur peut voir

### Scénario: Le médiateur ne se voit proposer ni son tag source ni le tag d'un autre

* Étant donné un médiateur dont le tag personnel est à fusionner
* Et un tag national candidat à la fusion
* Et un tag personnel d'un autre médiateur
* Quand ce médiateur cherche où fusionner son tag
* Alors le tag candidat est proposé
* Et ni le tag à fusionner ni le tag de l'autre médiateur ne sont proposés
