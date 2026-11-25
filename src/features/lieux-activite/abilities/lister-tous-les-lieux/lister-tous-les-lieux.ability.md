# Fonctionnalité: Lister tous les lieux d'activité

> L'annuaire complet, du point de vue de l'administration : celui où l'on
> cherche un lieu pour le corriger ou le fusionner, et non celui de ses propres
> lieux d'exercice.

## Règle: La recherche ratisse tout ce qui désigne le lieu

> Nom, SIRET, adresse, commune et code postal. Qui cherche un lieu ne sait pas
> toujours sous quel libellé il a été enregistré, mais il connaît au moins une
> de ces cinq choses.

### Scénario: Trouver un lieu par sa dénomination

* Étant donné trois lieux à administrer, dont deux à la même adresse
* Quand l’administration cherche « Cyberbase du Port »
* Alors un seul lieu est trouvé

### Scénario: Trouver des lieux par leur code postal

* Étant donné trois lieux à administrer, dont deux à la même adresse
* Quand l’administration cherche « 17300 »
* Alors deux lieux sont trouvés

### Scénario: Trouver un lieu par son SIRET

* Étant donné trois lieux à administrer, dont deux à la même adresse
* Quand l’administration cherche le SIRET du premier lieu
* Alors un seul lieu est trouvé

## Règle: Un lieu supprimé ne s'administre plus

### Scénario: Le lieu retiré sort de la liste

* Étant donné trois lieux à administrer, dont deux à la même adresse
* Et le premier de ces lieux est supprimé
* Quand l’administration cherche « 17300 »
* Alors un seul lieu est trouvé

## Règle: Un lieu sans adresse reconnue s'administre, pour qu'on la lui donne

### Scénario: Un lieu sans adresse reconnue par la BAN est signalé à préciser

* Étant donné trois lieux à administrer, dont deux à la même adresse
* Et le premier de ces lieux n'a pas d'adresse reconnue par la BAN
* Quand l’administration cherche « 17300 »
* Alors deux lieux sont trouvés
* Et seul le premier lieu est signalé avec une adresse à préciser

## Règle: Le total ne dépend pas de la recherche

> C'est le repère qui donne son sens au nombre de résultats : « 9 trouvés » ne
> dit rien sans « sur 12 750 ».

### Scénario: Le total reste celui de la coop entière

* Étant donné trois lieux à administrer, dont deux à la même adresse
* Quand l’administration cherche « Cyberbase du Port »
* Alors le total annoncé dépasse le nombre de lieux trouvés
