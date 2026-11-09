# Feature: Lister les tags

> La page des tags montre tous ceux que l'acteur peut voir : les siens, ceux
> de ses équipes, ceux de son département et les tags nationaux.

## Rule: La liste montre les tags visibles par l'acteur, et eux seuls

### Scenario: Le médiateur voit ses tags, ceux de son équipe, de son département et les nationaux

* Given un médiateur coordonné du 69 qui consulte ses tags
* And son tag personnel "Mon atelier"
* And le tag "Atelier d'équipe" de son équipe
* And le tag départemental "Rhône" du "69"
* And le tag départemental "Ain" du "01"
* And le tag personnel "Atelier d'un autre" d'un autre médiateur
* And son tag personnel "Atelier retiré" marqué supprimé
* When ce médiateur liste ses tags
* Then la liste contient "Mon atelier", "Atelier d'équipe" et "Rhône"
* And la liste ne contient ni "Ain", ni "Atelier d'un autre", ni "Atelier retiré"
* And le total annoncé correspond aux tags listés

## Rule: Un tag compte les accompagnements de ses activités et ses activités de coordination

### Scenario: Les accompagnements d'un tag s'additionnent

* Given un médiateur coordonné du 69 qui consulte ses tags
* And son tag personnel "Mon atelier"
* And ce tag porté par deux activités de 3 et 2 accompagnements
* And ce tag porté par une activité de coordination
* When ce médiateur liste ses tags
* Then le tag "Mon atelier" compte 6 accompagnements
