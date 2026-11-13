# Feature: Rechercher les lieux des statistiques

> Le filtre « Lieu » des statistiques cherche, côté serveur, parmi les lieux
> d'activité, les communes et les départements des activités du périmètre.
> Sans recherche, il propose les plus utilisés ; les lieux déjà choisis sont
> nommés pour leurs étiquettes.

## Rule: Seuls les lieux des activités vivantes du périmètre sont proposés, les plus utilisés d'abord

### Scenario: Les lieux d'activité les plus utilisés

* Given la médiatrice "Ada Lovelace"
* And la médiatrice "Grace Hopper"
* And les activités de "Ada Lovelace" :
  | date       | type       | lieu           | supprimee |
  | 2026-03-03 | individuel | Médiathèque    |           |
  | 2026-03-04 | individuel | Espace Lumière |           |
  | 2026-03-05 | individuel | Espace Lumière |           |
  | 2026-03-06 | individuel | Bibliothèque   | oui       |
* And les activités de "Grace Hopper" :
  | date       | type       | lieu            |
  | 2026-03-03 | individuel | Maison du Monde |
* When "Ada Lovelace" cherche "" parmi les lieux d'activité de ses statistiques
* Then les lieux proposés sont "Espace Lumière, Médiathèque"

## Rule: La recherche ignore la casse et les accents

### Scenario: Chercher un lieu d'activité sans accent

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | lieu           |
  | 2026-03-03 | individuel | Médiathèque    |
  | 2026-03-04 | individuel | Espace Lumière |
* When "Ada Lovelace" cherche "mediatheque" parmi les lieux d'activité de ses statistiques
* Then les lieux proposés sont "Médiathèque"

## Rule: Les communes et les départements viennent du lieu, sinon de la commune saisie

### Scenario: Communes et départements les plus utilisés

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | lieu           | typeLieu | communeDuLieu     |
  | 2026-03-03 | individuel | Espace Lumière |          |                   |
  | 2026-03-04 | individuel |                | Domicile | Thuir 66300 66210 |
  | 2026-03-05 | individuel |                | Domicile | Thuir 66300 66210 |
* When "Ada Lovelace" cherche "" parmi les communes de ses statistiques
* Then les lieux proposés sont "Thuir · 66300, Lyon · 69001"
* When "Ada Lovelace" cherche "rhone" parmi les départements de ses statistiques
* Then les lieux proposés sont "69 · Rhône"

## Rule: Les lieux choisis sont nommés pour leurs étiquettes

### Scenario: Nommer un lieu, une commune et un département choisis

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | lieu        | typeLieu | communeDuLieu     |
  | 2026-03-03 | individuel | Médiathèque |          |                   |
  | 2026-03-04 | individuel |             | Domicile | Thuir 66300 66210 |
* When je nomme le lieu "Médiathèque", la commune "66210" et le département "69"
* Then les lieux proposés sont "Médiathèque, Thuir · 66300, 69 · Rhône"
