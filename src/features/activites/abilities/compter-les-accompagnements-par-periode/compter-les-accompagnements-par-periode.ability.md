# Feature: Compter les accompagnements par période

> Les graphiques des statistiques : accompagnements par jour et par mois,
> sur une fenêtre glissante (30 jours, 12 mois) ou bornée par la période
> choisie.

## Rule: Chaque jour et chaque mois de la fenêtre a sa barre, même vide

### Scenario: Une fenêtre bornée sur trois mois

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes |
  | 2026-01-20 | individuel | 1        |
  | 2026-03-02 | collectif  | 3        |
  | 2026-03-09 | individuel | 1        |
* When je compte les accompagnements de "Ada Lovelace" par période du "2026-01-15" au "2026-03-10"
* Then les accompagnements par mois sont "2026-01 1, 2026-02 0, 2026-03 4"
* And les accompagnements du jour "2026-03-02" sont 3
* And la série par jour compte 55 jours

## Rule: Sans début, la fenêtre glisse jusqu'à la fin

### Scenario: Les 30 derniers jours et les 12 derniers mois

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       |
  | 2025-03-31 | individuel |
  | 2025-04-02 | individuel |
  | 2026-03-31 | individuel |
* When je compte les accompagnements de "Ada Lovelace" par période jusqu'au "2026-03-31"
* Then la série par jour compte 30 jours
* And la série par mois va de "2025-04" à "2026-03"
* And les accompagnements du mois "2025-04" sont 1

## Rule: Une équipe vide donne des séries à zéro

### Scenario: Un coordinateur sans équipe

* Given le coordinateur "Alan Turing"
* When je compte les accompagnements de "Alan Turing" par période jusqu'au "2026-03-31"
* Then la série par jour compte 30 jours
* And aucun accompagnement n'est compté par période
