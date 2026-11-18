# Feature: Répartir les accompagnements par tag

> Le nombre d'accompagnements de chaque tag porté par les activités du
> périmètre, le plus utilisé en premier.

## Rule: Un tag compte les accompagnements des activités qui le portent

### Scenario: Deux tags, dont un sur un atelier

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | tags                 |
  | 2026-03-03 | individuel | 1        | Numérique solidaire  |
  | 2026-03-05 | collectif  | 3        | Atelier, Numérique solidaire |
  | 2026-03-07 | individuel | 1        |                      |
* When je répartis les accompagnements de "Ada Lovelace" par tag
* Then les tags comptés sont "Numérique solidaire 4, Atelier 3"

## Rule: Un tag supprimé n'est plus compté

### Scenario: Le tag supprimé disparaît de la répartition

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | tags                |
  | 2026-03-03 | individuel | Numérique solidaire |
  | 2026-03-05 | individuel | Ancien tag          |
* And le tag "Ancien tag" est supprimé
* When je répartis les accompagnements de "Ada Lovelace" par tag
* Then les tags comptés sont "Numérique solidaire 1"
