# Feature: Compter les accompagnements par lieu

> Le nombre d'accompagnements de chaque lieu d'activité du périmètre, le
> plus fréquenté en premier. Les accompagnements hors d'un lieu ne sont pas
> comptés ici.

## Rule: Seuls les accompagnements tenus dans un lieu d'activité comptent

### Scenario: Deux lieux et un accompagnement à distance

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | lieu            | typeLieu  |
  | 2026-03-03 | collectif  | 3        | Espace Lumière  |           |
  | 2026-03-05 | individuel | 1        | Médiathèque     |           |
  | 2026-03-06 | individuel | 1        | Espace Lumière  |           |
  | 2026-03-07 | individuel | 1        |                 | ADistance |
* When je compte les accompagnements de "Ada Lovelace" par lieu
* Then les lieux comptés sont "Espace Lumière 4, Médiathèque 1"
