# Fonctionnalité: Supprimer un tag

> Un tag supprimé disparaît définitivement, ainsi que ses liens vers les
> activités et les activités de coordination qui le portaient.

## Règle: La suppression retire le tag de toutes les activités

### Scénario: Le médiateur supprime son tag utilisé dans une activité

* Étant donné un médiateur dont le tag personnel est utilisé dans une activité
* Quand ce médiateur supprime ce tag
* Alors la suppression du tag réussit
* Et ce tag n'existe plus
* Et l'activité ne porte plus ce tag

### Scénario: Le coordinateur supprime un tag d'équipe utilisé dans une activité de coordination

* Étant donné un coordinateur dont le tag d'équipe est utilisé dans une activité de coordination
* Quand ce coordinateur supprime ce tag
* Alors la suppression du tag réussit
* Et ce tag n'existe plus
* Et l'activité de coordination ne porte plus ce tag

## Règle: Seul celui qui gère le tag le supprime

### Scénario: Le médiateur ne supprime pas le tag personnel d'un autre

* Étant donné un médiateur dont le tag personnel est utilisé dans une activité
* Quand un autre médiateur supprime ce tag
* Alors la suppression du tag est refusée
* Et ce tag existe toujours

### Scénario: Le coordinateur ne supprime pas un tag national

* Étant donné un tag national
* Quand un coordinateur supprime ce tag
* Alors la suppression du tag est refusée
* Et ce tag existe toujours
