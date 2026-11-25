# Fonctionnalité: Lister les dernières activités d'un médiateur

## Règle: Les trois dernières activités enregistrées, de la plus récente à la plus ancienne

> L'ordre est celui de l'enregistrement, pas celui de la date de l'activité :
> le médiateur retrouve ce qu'il vient de saisir.

### Scénario: Quatre activités enregistrées, les trois dernières sont listées

* Étant donné un médiateur ayant enregistré 4 activités
* Quand je liste ses dernières activités
* Alors les activités listées sont "4, 3, 2"

## Règle: Seules les activités vivantes du médiateur sont listées

### Scénario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Étant donné un médiateur ayant enregistré 2 activités
* Et sa dernière activité est supprimée
* Et un autre médiateur vient d'enregistrer une activité
* Quand je liste ses dernières activités
* Alors les activités listées sont "1"
