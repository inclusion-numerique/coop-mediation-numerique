# Fonctionnalité: Répartir les accompagnements par tag

> Le nombre d'accompagnements de chaque tag porté par les activités du
> périmètre, le plus utilisé en premier.

## Règle: Un tag compte les accompagnements des activités qui le portent

### Scénario: Deux tags, dont un sur un atelier

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | tags                 |
  | 2026-03-03 | individuel | 1        | Numérique solidaire  |
  | 2026-03-05 | collectif  | 3        | Atelier, Numérique solidaire |
  | 2026-03-07 | individuel | 1        |                      |
* Quand je répartis les accompagnements de "Ada Lovelace" par tag
* Alors les tags comptés sont "Numérique solidaire 4, Atelier 3"

## Règle: Un tag supprimé n'est plus compté

### Scénario: Le tag supprimé disparaît de la répartition

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | tags                |
  | 2026-03-03 | individuel | Numérique solidaire |
  | 2026-03-05 | individuel | Ancien tag          |
* Et le tag "Ancien tag" est supprimé
* Quand je répartis les accompagnements de "Ada Lovelace" par tag
* Alors les tags comptés sont "Numérique solidaire 1"
