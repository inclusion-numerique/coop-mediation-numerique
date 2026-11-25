# Fonctionnalité: Compter les personnes accompagnées par commune

> La commune de résidence des personnes accompagnées dans le périmètre, la
> plus fréquente en premier. Chaque personne compte une fois.

## Règle: Chaque personne compte une fois dans sa commune de résidence

### Scénario: Deux communes et une résidence inconnue

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | residence | codePostal   | codeInsee |
  | 2026-03-03 | collectif  | 2        | Nice      | 06000, 06100 | 06088     |
  | 2026-03-05 | individuel | 1        | Thuir     | 66300        | 66210     |
  | 2026-03-07 | individuel | 1        |           |              |           |
* Quand je compte les personnes accompagnées par "Ada Lovelace" par commune
* Alors les communes de résidence comptées sont "Nice · 06000 2, Thuir · 66300 1, Non communiquée 1"
