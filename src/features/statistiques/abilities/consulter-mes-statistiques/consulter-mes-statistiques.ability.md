# Fonctionnalité: Consulter mes statistiques

> La page « Mes statistiques » présente l'activité de la personne connectée.
> Son titre dit à qui appartiennent les statistiques : un coordinateur qui ne
> fait pas de médiation lui-même y consulte l'activité de son équipe, pas la
> sienne.

## Règle: Le titre dépend de la part de médiation de la personne

### Plan du scénario: Un « <personne> » consulte « <titre> »

* Étant donné une personne connectée qui est "<personne>"
* Quand elle consulte ses statistiques
* Alors la page s'intitule "<titre>"

#### Exemples:

  | personne                                    | titre            |
  | ------------------------------------------- | ---------------- |
  | médiateur                                   | Mes statistiques |
  | coordinateur sans activité de médiation     | Statistiques     |
  | coordinateur qui fait aussi de la médiation | Mes statistiques |
