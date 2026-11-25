# Fonctionnalité: Vérifier un lieu d'activité

> Une activité de médiation ne se rattache qu'à un lieu où le médiateur exerce
> encore et qui est exploitable. Le lieu déjà rattaché à une activité reste
> accepté à sa modification, même s'il a fermé depuis.

## Règle: Le lieu doit être un lieu d'exercice actuel et exploitable du médiateur

### Scénario: Le lieu où le médiateur exerce est accepté

* Étant donné un médiateur exerçant dans un lieu exploitable
* Quand on vérifie ce lieu pour ce médiateur
* Alors le lieu est accepté

### Scénario: Un lieu où le médiateur n'exerce plus est refusé

* Étant donné un médiateur ayant cessé d'exercer dans un lieu exploitable
* Quand on vérifie ce lieu pour ce médiateur
* Alors le lieu est refusé

### Scénario: Le lieu déjà rattaché reste accepté

* Étant donné un médiateur ayant cessé d'exercer dans un lieu exploitable
* Quand on vérifie ce lieu pour ce médiateur, alors qu'il est déjà rattaché à l'activité
* Alors le lieu est accepté

## Règle: La saisie ne vérifie un lieu que pour un médiateur et un identifiant valides

### Scénario: Le lieu où le médiateur exerce est utilisable depuis la saisie

* Étant donné un médiateur exerçant dans un lieu exploitable
* Quand la saisie demande si ce lieu est utilisable par ce médiateur
* Alors le lieu est accepté

### Scénario: Un utilisateur sans médiateur ne peut utiliser aucun lieu

* Étant donné un médiateur exerçant dans un lieu exploitable
* Quand la saisie demande si ce lieu est utilisable sans médiateur
* Alors le lieu est refusé

### Scénario: Un identifiant de lieu invalide est refusé

* Étant donné un médiateur exerçant dans un lieu exploitable
* Quand la saisie demande si le lieu "pas-un-identifiant" est utilisable par ce médiateur
* Alors le lieu est refusé
