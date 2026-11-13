# Feature: Compter les personnes accompagnées par commune

> La commune de résidence des personnes accompagnées dans le périmètre, la
> plus fréquente en premier. Chaque personne compte une fois.

## Rule: Chaque personne compte une fois dans sa commune de résidence

### Scenario: Deux communes et une résidence inconnue

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | anonymes | residence | codePostal   | codeInsee |
  | 2026-03-03 | collectif  | 2        | Nice      | 06000, 06100 | 06088     |
  | 2026-03-05 | individuel | 1        | Thuir     | 66300        | 66210     |
  | 2026-03-07 | individuel | 1        |           |              |           |
* When je compte les personnes accompagnées par "Ada Lovelace" par commune
* Then les communes de résidence comptées sont "Nice · 06000 2, Thuir · 66300 1, Non communiquée 1"
