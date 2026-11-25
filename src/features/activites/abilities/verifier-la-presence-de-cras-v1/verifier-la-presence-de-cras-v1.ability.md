# Fonctionnalité: Vérifier la présence de CRA v1

> Les statistiques ne proposent le filtre de source (Coop ou import v1)
> qu'à ceux qui ont des CRA v1.

## Règle: Un médiateur a des CRA v1 s'il a au moins une activité importée de la v1

### Scénario: Une médiatrice avec une activité importée

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | v1  |
  | 2026-03-03 | individuel | oui |
* Quand je vérifie la présence de CRA v1 pour "Ada Lovelace"
* Alors les CRA v1 sont "Presents"

### Scénario: Une médiatrice sans activité importée

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       |
  | 2026-03-03 | individuel |
* Quand je vérifie la présence de CRA v1 pour "Ada Lovelace"
* Alors les CRA v1 sont "Absents"

## Règle: Une équipe est présumée en avoir

### Scénario: Un coordinateur sans équipe

* Étant donné le coordinateur "Alan Turing"
* Quand je vérifie la présence de CRA v1 pour "Alan Turing"
* Alors les CRA v1 sont "Presents"
