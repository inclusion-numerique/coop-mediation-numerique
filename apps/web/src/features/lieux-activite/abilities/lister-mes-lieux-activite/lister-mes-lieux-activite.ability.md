# Feature: Lister ses lieux d'activité

## Rule: Seuls les lieux où l'on exerce aujourd'hui sont listés

### Scenario: Le lieu où le médiateur exerce est listé

* Given un médiateur qui exerce dans un lieu
* When ce médiateur liste ses lieux d'activité
* Then la liste contient ce lieu

### Scenario: Un lieu quitté sort de la liste

* Given un médiateur qui exerce dans un lieu
* When ce médiateur quitte ce lieu puis liste ses lieux d'activité
* Then la liste est vide

### Scenario: Les lieux d'un autre médiateur ne sont pas listés

* Given un médiateur qui exerce dans un lieu
* When un médiateur étranger liste ses lieux d'activité
* Then la liste est vide

## Rule: Un tri inconnu retombe sur l'ordre alphabétique

> L'ordre vient de l'URL : un lien périmé ne doit pas casser la page.

### Scenario: Un tri fantaisiste est ignoré

* Given un médiateur qui exerce dans un lieu
* When ce médiateur liste ses lieux avec le tri « au hasard »
* Then la liste contient ce lieu

## Rule: L'identité cartographique vient du registre, pas d'une copie

> La coop en tenait un double dans `id_cartographie_nationale`, posé par un job.
> Les deux ont dérivé : sur 12 764 lieux appariés, 561 ne s'accordaient plus, et
> dans les deux sens. L'identifiant appartient à la cartographie nationale, dont
> le registre de l'Entrepôt est le domicile — c'est là qu'on va le chercher.

### Scenario: Le lieu listé porte l'identifiant que le registre lui donne

* Given un médiateur qui exerce dans un lieu
* And le registre donne à ce lieu un autre identifiant de cartographie que la coop
* When ce médiateur liste ses lieux d'activité
* Then le lieu listé porte l'identifiant du registre
