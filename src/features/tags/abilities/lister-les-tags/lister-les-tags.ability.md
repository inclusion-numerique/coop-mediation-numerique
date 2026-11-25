# Fonctionnalité: Lister les tags

> La page des tags montre tous ceux que l'acteur peut voir : les siens, ceux
> de ses équipes, ceux de son département et les tags nationaux.

## Règle: La liste montre les tags visibles par l'acteur, et eux seuls

### Scénario: Le médiateur voit ses tags, ceux de son équipe, de son département et les nationaux

* Étant donné un médiateur coordonné du 69 qui consulte ses tags
* Et son tag personnel "Mon atelier"
* Et le tag "Atelier d'équipe" de son équipe
* Et le tag départemental "Rhône" du "69"
* Et le tag départemental "Ain" du "01"
* Et le tag personnel "Atelier d'un autre" d'un autre médiateur
* Et son tag personnel "Atelier retiré" marqué supprimé
* Quand ce médiateur liste ses tags
* Alors la liste contient "Mon atelier", "Atelier d'équipe" et "Rhône"
* Et la liste ne contient ni "Ain", ni "Atelier d'un autre", ni "Atelier retiré"
* Et le total annoncé correspond aux tags listés

## Règle: Un tag compte les accompagnements de ses activités et ses activités de coordination

### Scénario: Les accompagnements d'un tag s'additionnent

* Étant donné un médiateur coordonné du 69 qui consulte ses tags
* Et son tag personnel "Mon atelier"
* Et ce tag porté par deux activités de 3 et 2 accompagnements
* Et ce tag porté par une activité de coordination
* Quand ce médiateur liste ses tags
* Alors le tag "Mon atelier" compte 6 accompagnements
