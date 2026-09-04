# Feature: Inventorier les lieux pour les clients d'API

> Ce que la coop tient à disposition de qui veut en tenir un miroir. Le
> périmètre n'est pas celui de la cartographie : ici on rend tout, et l'on dit
> ce qui a disparu.

## Rule: L'inventaire ne cache rien

> Un client qui synchronise a besoin de savoir qu'une ligne s'est éteinte. La
> taire la laisserait vivante chez lui pour toujours.

### Scenario: Un lieu supprimé figure encore à l'inventaire

* Given un lieu à inventorier
* And ce lieu a été retiré
* When un client d'API demande l'inventaire de ce lieu
* Then ce lieu figure à l'inventaire
* And sa suppression est datée

### Scenario: Un lieu non partagé sur la cartographie figure à l'inventaire

* Given un lieu à inventorier
* And ce lieu n'est pas partagé sur la cartographie nationale
* When un client d'API demande l'inventaire de ce lieu
* Then ce lieu figure à l'inventaire

## Rule: On ne redemande que ce qui a changé

### Scenario: Le filtre de modification écarte ce qui n'a pas bougé

* Given un lieu à inventorier
* When un client d'API demande les lieux modifiés depuis demain
* Then ce lieu ne figure pas à l'inventaire
