# Fonctionnalité: Retirer un médiateur de ses lieux d'activité

## Règle: Le rattachement est supprimé, pas daté

> Les rattachements ne reviennent pas : une personne qui revient recrée un
> compte et redéclare où elle exerce, ce qui est de toute façon la seule
> information à jour.

### Scénario: Tous les rattachements du médiateur sont coupés

* Étant donné un médiateur rattaché à deux lieux d'activité
* Quand je retire ce médiateur de ses lieux
* Alors le retrait porte sur 2 rattachements
* Et ce médiateur n'est plus rattaché à aucun lieu
* Et les lieux eux-mêmes existent toujours

## Règle: Rejouer le retrait ne fait rien de plus

### Scénario: Un second retrait ne trouve plus rien

* Étant donné un médiateur rattaché à deux lieux d'activité
* Quand je retire ce médiateur de ses lieux
* Et je retire à nouveau ce médiateur de ses lieux
* Alors le retrait porte sur 0 rattachement
