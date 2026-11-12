# Feature: Vérifier un lieu d'activité

> Une activité de médiation ne se rattache qu'à un lieu où le médiateur exerce
> encore et qui est exploitable. Le lieu déjà rattaché à une activité reste
> accepté à sa modification, même s'il a fermé depuis.

## Rule: Le lieu doit être un lieu d'exercice actuel et exploitable du médiateur

### Scenario: Le lieu où le médiateur exerce est accepté

* Given un médiateur exerçant dans un lieu exploitable
* When on vérifie ce lieu pour ce médiateur
* Then le lieu est accepté

### Scenario: Un lieu où le médiateur n'exerce plus est refusé

* Given un médiateur ayant cessé d'exercer dans un lieu exploitable
* When on vérifie ce lieu pour ce médiateur
* Then le lieu est refusé

### Scenario: Le lieu déjà rattaché reste accepté

* Given un médiateur ayant cessé d'exercer dans un lieu exploitable
* When on vérifie ce lieu pour ce médiateur, alors qu'il est déjà rattaché à l'activité
* Then le lieu est accepté

## Rule: La saisie ne vérifie un lieu que pour un médiateur et un identifiant valides

### Scenario: Le lieu où le médiateur exerce est utilisable depuis la saisie

* Given un médiateur exerçant dans un lieu exploitable
* When la saisie demande si ce lieu est utilisable par ce médiateur
* Then le lieu est accepté

### Scenario: Un utilisateur sans médiateur ne peut utiliser aucun lieu

* Given un médiateur exerçant dans un lieu exploitable
* When la saisie demande si ce lieu est utilisable sans médiateur
* Then le lieu est refusé

### Scenario: Un identifiant de lieu invalide est refusé

* Given un médiateur exerçant dans un lieu exploitable
* When la saisie demande si le lieu "pas-un-identifiant" est utilisable par ce médiateur
* Then le lieu est refusé
