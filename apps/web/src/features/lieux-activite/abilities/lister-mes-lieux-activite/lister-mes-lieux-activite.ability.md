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
