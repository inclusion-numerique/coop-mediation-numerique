# Fonctionnalité: Lister les lieux d'un médiateur

## Règle: Seuls les lieux où l'on exerce aujourd'hui sont listés

### Scénario: Le lieu où le médiateur exerce est listé

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur liste ses lieux d'activité
* Alors la liste contient ce lieu

### Scénario: Un lieu quitté sort de la liste

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur quitte ce lieu puis liste ses lieux d'activité
* Alors la liste est vide

### Scénario: Les lieux d'un autre médiateur ne sont pas listés

* Étant donné un médiateur qui exerce dans un lieu
* Quand un médiateur étranger liste ses lieux d'activité
* Alors la liste est vide

## Règle: Un lieu sans adresse reconnue reste listé, pour qu'on la lui donne

> La liste mène à la fiche, seul endroit où l'on corrige une adresse : le lieu y
> figure, signalé.

### Scénario: Un lieu sans adresse reconnue par la BAN est signalé à préciser

* Étant donné un médiateur qui exerce dans un lieu
* Et ce lieu n'a pas d'adresse reconnue par la BAN
* Quand ce médiateur liste ses lieux d'activité
* Alors la liste contient ce lieu
* Et ce lieu est signalé avec une adresse à préciser

### Scénario: Un lieu reconnu par la BAN n'est pas signalé

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur liste ses lieux d'activité
* Alors ce lieu n'est pas signalé avec une adresse à préciser

## Règle: Un tri inconnu retombe sur l'ordre alphabétique

> L'ordre vient de l'URL : un lien périmé ne doit pas casser la page.

### Scénario: Un tri fantaisiste est ignoré

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur liste ses lieux avec le tri « au hasard »
* Alors la liste contient ce lieu

## Règle: L'identité cartographique vient du registre

> La coop en tenait un double dans `id_cartographie_nationale`, posé par un job.
> Les deux avaient dérivé : sur 12 764 lieux appariés, 561 ne s'accordaient plus,
> et dans les deux sens. La colonne a été retirée — l'identifiant appartient à la
> cartographie nationale, dont le registre de l'Entrepôt est le domicile.

### Scénario: Le lieu listé porte l'identifiant que le registre lui donne

* Étant donné un médiateur qui exerce dans un lieu
* Et le registre donne à ce lieu un identifiant de cartographie
* Quand ce médiateur liste ses lieux d'activité
* Alors le lieu listé porte l'identifiant du registre
