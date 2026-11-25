# Fonctionnalité: Rechercher les lieux des statistiques

> Le filtre « Lieu » des statistiques cherche, côté serveur, parmi les lieux
> d'activité, les communes et les départements des activités du périmètre.
> Sans recherche, il propose les plus utilisés ; les lieux déjà choisis sont
> nommés pour leurs étiquettes.

## Règle: Seuls les lieux des activités vivantes du périmètre sont proposés, les plus utilisés d'abord

### Scénario: Les lieux d'activité les plus utilisés

* Étant donné la médiatrice "Ada Lovelace"
* Et la médiatrice "Grace Hopper"
* Et les activités de "Ada Lovelace" :
  | date       | type       | lieu           | supprimee |
  | 2026-03-03 | individuel | Médiathèque    |           |
  | 2026-03-04 | individuel | Espace Lumière |           |
  | 2026-03-05 | individuel | Espace Lumière |           |
  | 2026-03-06 | individuel | Bibliothèque   | oui       |
* Et les activités de "Grace Hopper" :
  | date       | type       | lieu            |
  | 2026-03-03 | individuel | Maison du Monde |
* Quand "Ada Lovelace" cherche "" parmi les lieux d'activité de ses statistiques
* Alors les lieux proposés sont "Espace Lumière, Médiathèque"

## Règle: La recherche ignore la casse et les accents

### Scénario: Chercher un lieu d'activité sans accent

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | lieu           |
  | 2026-03-03 | individuel | Médiathèque    |
  | 2026-03-04 | individuel | Espace Lumière |
* Quand "Ada Lovelace" cherche "mediatheque" parmi les lieux d'activité de ses statistiques
* Alors les lieux proposés sont "Médiathèque"

## Règle: Les communes et les départements viennent du lieu, sinon de la commune saisie

### Scénario: Communes et départements les plus utilisés

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | lieu           | typeLieu | communeDuLieu     |
  | 2026-03-03 | individuel | Espace Lumière |          |                   |
  | 2026-03-04 | individuel |                | Domicile | Thuir 66300 66210 |
  | 2026-03-05 | individuel |                | Domicile | Thuir 66300 66210 |
* Quand "Ada Lovelace" cherche "" parmi les communes de ses statistiques
* Alors les lieux proposés sont "Thuir · 66300, Lyon · 69001"
* Quand "Ada Lovelace" cherche "rhone" parmi les départements de ses statistiques
* Alors les lieux proposés sont "69 · Rhône"

## Règle: Les lieux choisis sont nommés pour leurs étiquettes

### Scénario: Nommer un lieu, une commune et un département choisis

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | lieu        | typeLieu | communeDuLieu     |
  | 2026-03-03 | individuel | Médiathèque |          |                   |
  | 2026-03-04 | individuel |             | Domicile | Thuir 66300 66210 |
* Quand "Ada Lovelace" nomme le lieu "Médiathèque", la commune "66210" et le département "69"
* Alors les lieux proposés sont "Médiathèque, Thuir · 66300, 69 · Rhône"

### Scénario: Un lieu hors du périmètre n'est pas nommé

* Étant donné la médiatrice "Ada Lovelace"
* Et la médiatrice "Grace Hopper"
* Et les activités de "Grace Hopper" :
  | date       | type       | lieu            |
  | 2026-03-03 | individuel | Maison du Monde |
* Quand "Ada Lovelace" nomme le lieu "Maison du Monde"
* Alors les lieux proposés sont ""

## Règle: Les caractères spéciaux sont cherchés tels quels

### Scénario: Un tiret bas ne remplace pas n'importe quel caractère

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | lieu           |
  | 2026-03-03 | individuel | Médiathèque    |
* Quand "Ada Lovelace" cherche "_" parmi les lieux d'activité de ses statistiques
* Alors les lieux proposés sont ""
