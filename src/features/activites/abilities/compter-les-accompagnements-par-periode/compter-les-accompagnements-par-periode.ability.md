# Fonctionnalité: Compter les accompagnements par période

> Les graphiques des statistiques : accompagnements par jour et par mois,
> sur une fenêtre glissante (30 jours, 12 mois) ou bornée par la période
> choisie.

## Règle: Chaque jour et chaque mois de la fenêtre a sa barre, même vide

### Scénario: Une fenêtre bornée sur trois mois

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes |
  | 2026-01-20 | individuel | 1        |
  | 2026-03-02 | collectif  | 3        |
  | 2026-03-09 | individuel | 1        |
* Quand je compte les accompagnements de "Ada Lovelace" par période du "2026-01-15" au "2026-03-10"
* Alors les accompagnements par mois sont "2026-01 1, 2026-02 0, 2026-03 4"
* Et les accompagnements du jour "2026-03-02" sont 3
* Et la série par jour compte 55 jours

## Règle: Sans début, la fenêtre glisse jusqu'à la fin

### Scénario: Les 30 derniers jours et les 12 derniers mois

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       |
  | 2025-03-31 | individuel |
  | 2025-04-02 | individuel |
  | 2026-03-31 | individuel |
* Quand je compte les accompagnements de "Ada Lovelace" par période jusqu'au "2026-03-31"
* Alors la série par jour compte 30 jours
* Et la série par mois va de "2025-04" à "2026-03"
* Et les accompagnements du mois "2025-04" sont 1

## Règle: Une équipe vide donne des séries à zéro

### Scénario: Un coordinateur sans équipe

* Étant donné le coordinateur "Alan Turing"
* Quand je compte les accompagnements de "Alan Turing" par période jusqu'au "2026-03-31"
* Alors la série par jour compte 30 jours
* Et aucun accompagnement n'est compté par période
