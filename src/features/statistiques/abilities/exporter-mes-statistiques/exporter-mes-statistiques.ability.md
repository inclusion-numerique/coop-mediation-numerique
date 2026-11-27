# Fonctionnalité: Exporter mes statistiques

> Un médiateur ou un coordinateur exporte ses statistiques dans un classeur.
> Il peut restreindre l'export à des médiateurs : les siens, ceux qu'il
> coordonne ou a coordonnés, jamais un autre.

## Règle: Seul un médiateur ou un coordinateur exporte des statistiques

### Scénario: Un médiateur exporte ses propres statistiques

* Étant donné un médiateur
* Quand il exporte les statistiques de "lui-même"
* Alors l'export est préparé

### Scénario: Un compte ni médiateur ni coordinateur ne peut rien exporter

* Étant donné un compte ni médiateur ni coordinateur
* Quand il exporte ses statistiques
* Alors l'export est refusé : "ExportNonAutorise"

## Règle: On n'exporte que les médiateurs de son périmètre

### Scénario: Un coordinateur exporte un médiateur de son équipe

* Étant donné un coordinateur
* Quand il exporte les statistiques de "un médiateur coordonné"
* Alors l'export est préparé

### Scénario: Un médiateur n'exporte pas les statistiques d'un autre

* Étant donné un médiateur
* Quand il exporte les statistiques de "un autre médiateur"
* Alors l'export est refusé : "ExportDUnAutreMediateur"
