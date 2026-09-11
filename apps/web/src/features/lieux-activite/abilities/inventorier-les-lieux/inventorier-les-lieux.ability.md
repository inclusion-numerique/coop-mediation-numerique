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

## Rule: Une reprise par une autre source est une modification

> La fiche rendue vient du registre de l'Entrepôt, où toutes les sources
> écrivent. Ne dater l'inventaire que des écritures de la coop laisserait une
> valeur reprise par un autre producteur passer sous le filtre : le client la
> raterait, et ne la redemanderait jamais — une synchronisation incrémentale ne
> revient pas sur ce qu'elle croit à jour.

### Scenario: Un lieu que la coop n'a pas touché mais qu'une autre source a repris figure parmi les modifiés

* Given un lieu à inventorier
* And la coop n'a pas touché à ce lieu depuis l'an dernier
* And une autre source l'a repris hier
* When un client d'API demande les lieux modifiés depuis la semaine dernière
* Then ce lieu figure à l'inventaire
* And sa date de modification est celle de la reprise

## Rule: L'inventaire parle le vocabulaire du schéma national

> Un client qui tient un miroir attend les termes du standard, pas les noms
> sous lesquels la coop range ses nomenclatures en base. La traduction lui est
> due : c'est la seule chose qu'il ne peut pas deviner.

### Scenario: Les nomenclatures sortent dans les termes du schéma national

* Given un lieu à inventorier
* And ce lieu déclare un service, des frais et une modalité d'accès
* When un client d'API demande l'inventaire de ce lieu
* Then ses nomenclatures sont dites dans les termes du schéma national
