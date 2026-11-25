# Fonctionnalité: Compter les accompagnements par lieu

> Le nombre d'accompagnements de chaque lieu d'activité du périmètre, le
> plus fréquenté en premier. Les accompagnements hors d'un lieu ne sont pas
> comptés ici.

## Règle: Seuls les accompagnements tenus dans un lieu d'activité comptent

### Scénario: Deux lieux et un accompagnement à distance

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | lieu            | typeLieu  |
  | 2026-03-03 | collectif  | 3        | Espace Lumière  |           |
  | 2026-03-05 | individuel | 1        | Médiathèque     |           |
  | 2026-03-06 | individuel | 1        | Espace Lumière  |           |
  | 2026-03-07 | individuel | 1        |                 | ADistance |
* Quand je compte les accompagnements de "Ada Lovelace" par lieu
* Alors les lieux comptés sont "Espace Lumière 4, Médiathèque 1"
