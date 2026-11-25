# Fonctionnalité: Inventorier les lieux pour les clients d'API

> Ce que la coop tient à disposition de qui veut en tenir un miroir. Le
> périmètre n'est pas celui de la cartographie : ici on rend tout, et l'on dit
> ce qui a disparu.

## Règle: L'inventaire ne cache rien

> Un client qui synchronise a besoin de savoir qu'une ligne s'est éteinte. La
> taire la laisserait vivante chez lui pour toujours.

### Scénario: Un lieu supprimé figure encore à l'inventaire

* Étant donné un lieu à inventorier
* Et ce lieu a été retiré
* Quand un client d'API demande l'inventaire de ce lieu
* Alors ce lieu figure à l'inventaire
* Et sa suppression est datée

### Scénario: Un lieu non partagé sur la cartographie figure à l'inventaire

* Étant donné un lieu à inventorier
* Et ce lieu n'est pas partagé sur la cartographie nationale
* Quand un client d'API demande l'inventaire de ce lieu
* Alors ce lieu figure à l'inventaire

## Règle: On ne redemande que ce qui a changé

### Scénario: Le filtre de modification écarte ce qui n'a pas bougé

* Étant donné un lieu à inventorier
* Quand un client d'API demande les lieux modifiés depuis demain
* Alors ce lieu ne figure pas à l'inventaire

## Règle: Une reprise par une autre source est une modification

> La fiche rendue vient du registre de l'Entrepôt, où toutes les sources
> écrivent. Ne dater l'inventaire que des écritures de la coop laisserait une
> valeur reprise par un autre producteur passer sous le filtre : le client la
> raterait, et ne la redemanderait jamais — une synchronisation incrémentale ne
> revient pas sur ce qu'elle croit à jour.

### Scénario: Un lieu que la coop n'a pas touché mais qu'une autre source a repris figure parmi les modifiés

* Étant donné un lieu à inventorier
* Et la coop n'a pas touché à ce lieu depuis l'an dernier
* Et une autre source l'a repris hier
* Quand un client d'API demande les lieux modifiés depuis la semaine dernière
* Alors ce lieu figure à l'inventaire
* Et sa date de modification est celle de la reprise

## Règle: L'inventaire parle le vocabulaire du schéma national

> Un client qui tient un miroir attend les termes du standard, pas les noms
> sous lesquels la coop range ses nomenclatures en base. La traduction lui est
> due : c'est la seule chose qu'il ne peut pas deviner.

### Scénario: Les nomenclatures sortent dans les termes du schéma national

* Étant donné un lieu à inventorier
* Et ce lieu déclare un service, des frais et une modalité d'accès
* Quand un client d'API demande l'inventaire de ce lieu
* Alors ses nomenclatures sont dites dans les termes du schéma national
