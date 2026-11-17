# Feature: Compter les activités de coordination par trimestre

## Rule: Seules les activités vivantes du coordinateur comptent

> Une activité supprimée ne compte plus, celle d'un autre coordinateur non
> plus.

### Scenario: Les activités supprimées et celles d'un autre coordinateur sont écartées

* Given un coordinateur ayant enregistré des activités de coordination
* And une activité de coordination supprimée
* And une activité de coordination d'un autre coordinateur
* When je compte ses activités de coordination
* Then le cumul compte 2 animations, 1 évènement et 0 partenariat

## Rule: Les activités se rangent par trimestre, le plus récent en premier

### Scenario: Deux trimestres d'activité

* Given un coordinateur ayant enregistré des activités de coordination
* When je compte ses activités de coordination
* Then les trimestres comptés sont "2026-2, 2026-1"
