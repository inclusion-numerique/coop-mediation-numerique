# Feature: La structure employeuse comme lieu d’activité

## Rule: Déclarer sa structure employeuse comme lieu d’activité la rattache

### Scenario: Oui — la structure employeuse devient un lieu d’activité

* Given je suis médiateur
* And j’ai une structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ma structure employeuse est rattachée comme lieu d’activité

### Scenario: Rattacher deux fois ne crée qu’un seul lieu d’activité

* Given je suis médiateur
* And j’ai une structure employeuse
* And ma structure employeuse est déjà rattachée comme lieu d’activité
* When je déclare que ma structure employeuse est un lieu d’activité
* Then ma structure employeuse n’a qu’un seul lieu d’activité actif

### Scenario: Deux médiateurs de la même employeuse partagent le lieu

* Given je suis médiateur
* And j’ai une structure employeuse
* And un collègue partage ma structure employeuse
* When je déclare que ma structure employeuse est un lieu d’activité
* And mon collègue déclare que notre structure employeuse est un lieu d’activité
* Then nous sommes rattachés au même lieu d’activité

## Rule: Déclarer que ce n’est pas un lieu d’activité la détache

### Scenario: Non — la structure employeuse cesse d’être un lieu d’activité

* Given je suis médiateur
* And j’ai une structure employeuse
* And ma structure employeuse est déjà rattachée comme lieu d’activité
* When je déclare que ma structure employeuse n’est pas un lieu d’activité
* Then ma structure employeuse n’est plus rattachée comme lieu d’activité

## Rule: Une employeuse que la coop connaît déjà comme lieu n’est pas recréée

Le lieu ne porte aucun lien vers l’employeuse : on le reconnaît par la sonde de
corrélation de la feature. La coop peut déjà le connaître sous une autre
dénomination que celle de `main` — le comparer à l’identique en créerait un
doublon.

### Scenario: L’employeuse est rattachée au lieu que la coop connaissait déjà

* Given je suis médiateur
* And j’ai une structure employeuse dénommée comme une mairie
* And la coop connaît déjà ce lieu sous la dénomination de la commune
* When je déclare que ma structure employeuse est un lieu d’activité
* Then je suis rattaché au lieu que la coop connaissait déjà
* And ce lieu n’a pas été recréé
