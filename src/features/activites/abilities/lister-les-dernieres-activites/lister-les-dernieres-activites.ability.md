# Feature: Lister les dernières activités d'un médiateur

## Rule: Les trois dernières activités enregistrées, de la plus récente à la plus ancienne

> L'ordre est celui de l'enregistrement, pas celui de la date de l'activité :
> le médiateur retrouve ce qu'il vient de saisir.

### Scenario: Quatre activités enregistrées, les trois dernières sont listées

* Given un médiateur ayant enregistré 4 activités
* When je liste ses dernières activités
* Then les activités listées sont "4, 3, 2"

## Rule: Seules les activités vivantes du médiateur sont listées

### Scenario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Given un médiateur ayant enregistré 2 activités
* And sa dernière activité est supprimée
* And un autre médiateur vient d'enregistrer une activité
* When je liste ses dernières activités
* Then les activités listées sont "1"
