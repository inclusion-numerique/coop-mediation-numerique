# Feature: Consulter mes statistiques

> La page « Mes statistiques » présente l'activité de la personne connectée.
> Son titre dit à qui appartiennent les statistiques : un coordinateur qui ne
> fait pas de médiation lui-même y consulte l'activité de son équipe, pas la
> sienne.

## Rule: Le titre dépend de la part de médiation de la personne

### Scenario Outline: Un « <personne> » consulte « <titre> »

* Given une personne connectée qui est "<personne>"
* When elle consulte ses statistiques
* Then la page s'intitule "<titre>"

#### Examples:

  | personne                                    | titre            |
  | ------------------------------------------- | ---------------- |
  | médiateur                                   | Mes statistiques |
  | coordinateur sans activité de médiation     | Statistiques     |
  | coordinateur qui fait aussi de la médiation | Mes statistiques |
