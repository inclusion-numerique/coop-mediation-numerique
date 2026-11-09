# Feature: Supprimer un tag

> Un tag supprimé disparaît définitivement, ainsi que ses liens vers les
> activités et les activités de coordination qui le portaient.

## Rule: La suppression retire le tag de toutes les activités

### Scenario: Le médiateur supprime son tag utilisé dans une activité

* Given un médiateur dont le tag personnel est utilisé dans une activité
* When ce médiateur supprime ce tag
* Then la suppression du tag réussit
* And ce tag n'existe plus
* And l'activité ne porte plus ce tag

### Scenario: Le coordinateur supprime un tag d'équipe utilisé dans une activité de coordination

* Given un coordinateur dont le tag d'équipe est utilisé dans une activité de coordination
* When ce coordinateur supprime ce tag
* Then la suppression du tag réussit
* And ce tag n'existe plus
* And l'activité de coordination ne porte plus ce tag

## Rule: Seul celui qui gère le tag le supprime

### Scenario: Le médiateur ne supprime pas le tag personnel d'un autre

* Given un médiateur dont le tag personnel est utilisé dans une activité
* When un autre médiateur supprime ce tag
* Then la suppression du tag est refusée
* And ce tag existe toujours

### Scenario: Le coordinateur ne supprime pas un tag national

* Given un tag national
* When un coordinateur supprime ce tag
* Then la suppression du tag est refusée
* And ce tag existe toujours
