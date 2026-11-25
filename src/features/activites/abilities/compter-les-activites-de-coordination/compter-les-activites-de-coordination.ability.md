# Fonctionnalité: Compter les activités de coordination par trimestre

## Règle: Seules les activités vivantes du coordinateur comptent

> Une activité supprimée ne compte plus, celle d'un autre coordinateur non
> plus.

### Scénario: Les activités supprimées et celles d'un autre coordinateur sont écartées

* Étant donné un coordinateur ayant enregistré des activités de coordination
* Et une activité de coordination supprimée
* Et une activité de coordination d'un autre coordinateur
* Quand je compte ses activités de coordination
* Alors le cumul compte 2 animations, 1 évènement et 0 partenariat

## Règle: Les activités se rangent par trimestre, le plus récent en premier

### Scénario: Deux trimestres d'activité

* Étant donné un coordinateur ayant enregistré des activités de coordination
* Quand je compte ses activités de coordination
* Alors les trimestres comptés sont "2026-2, 2026-1"
