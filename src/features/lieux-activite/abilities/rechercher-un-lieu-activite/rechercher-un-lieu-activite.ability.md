# Fonctionnalité: Rechercher un de ses lieux d'activité

> La recherche ne porte que sur les lieux où le médiateur exerce : c'est un
> choix parmi les siens, pas une exploration de l'annuaire. Qui n'est pas
> médiateur n'exerce nulle part : l'action rend une liste vide plutôt qu'une
> erreur, parce qu'un champ de saisie n'a rien à faire d'un refus.

## Règle: Seuls les lieux où l'on exerce sont proposés

### Scénario: Le lieu d'un autre médiateur n'est pas proposé

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur cherche « Maison »
* Alors la recherche propose ce lieu
* Et un médiateur étranger qui cherche « Maison » ne trouve rien

### Scénario: Un lieu quitté n'est plus proposé

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur se retire de ce lieu puis cherche « Maison »
* Alors la recherche ne propose rien

## Règle: Seuls les lieux exploitables sont proposés

### Scénario: Un lieu sans adresse reconnue par la BAN n'est pas proposé

* Étant donné un médiateur qui exerce dans un lieu
* Et ce lieu n'a pas d'adresse reconnue par la BAN
* Quand ce médiateur cherche « Maison »
* Alors la recherche ne propose rien

### Scénario: Un lieu supprimé n'est pas proposé

* Étant donné un médiateur qui exerce dans un lieu
* Et ce lieu est supprimé
* Quand ce médiateur cherche « Maison »
* Alors la recherche ne propose rien

## Règle: La recherche porte sur le nom du lieu

### Scénario: Une recherche sans correspondance ne propose rien

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur cherche « Piscine »
* Alors la recherche ne propose rien
