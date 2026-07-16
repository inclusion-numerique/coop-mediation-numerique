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

## Rule: Déclarer que ce n’est pas un lieu d’activité la détache

### Scenario: Non — la structure employeuse cesse d’être un lieu d’activité

* Given je suis médiateur
* And j’ai une structure employeuse
* And ma structure employeuse est déjà rattachée comme lieu d’activité
* When je déclare que ma structure employeuse n’est pas un lieu d’activité
* Then ma structure employeuse n’est plus rattachée comme lieu d’activité
