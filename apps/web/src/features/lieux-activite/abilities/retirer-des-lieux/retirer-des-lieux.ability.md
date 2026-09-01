# Feature: Retirer un médiateur de ses lieux d'activité

## Rule: Le rattachement est supprimé, pas daté

> Le contrat de résurrection dit que les rattachements ne reviennent pas : une
> personne qui revient redéclare où elle exerce, ce qui est de toute façon la
> seule information à jour.

### Scenario: Tous les rattachements du médiateur sont coupés

* Given un médiateur rattaché à deux lieux d'activité
* When je retire ce médiateur de ses lieux
* Then le retrait porte sur 2 rattachements
* And ce médiateur n'est plus rattaché à aucun lieu
* And les lieux eux-mêmes existent toujours

## Rule: Rejouer le retrait ne fait rien de plus

### Scenario: Un second retrait ne trouve plus rien

* Given un médiateur rattaché à deux lieux d'activité
* When je retire ce médiateur de ses lieux
* And je retire à nouveau ce médiateur de ses lieux
* Then le retrait porte sur 0 rattachement
