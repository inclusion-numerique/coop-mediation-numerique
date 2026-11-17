# Feature: Vérifier la présence de CRA v1

> Les statistiques ne proposent le filtre de source (Coop ou import v1)
> qu'à ceux qui ont des CRA v1.

## Rule: Un médiateur a des CRA v1 s'il a au moins une activité importée de la v1

### Scenario: Une médiatrice avec une activité importée

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       | v1  |
  | 2026-03-03 | individuel | oui |
* When je vérifie la présence de CRA v1 pour "Ada Lovelace"
* Then les CRA v1 sont "Presents"

### Scenario: Une médiatrice sans activité importée

* Given la médiatrice "Ada Lovelace"
* And les activités de "Ada Lovelace" :
  | date       | type       |
  | 2026-03-03 | individuel |
* When je vérifie la présence de CRA v1 pour "Ada Lovelace"
* Then les CRA v1 sont "Absents"

## Rule: Une équipe est présumée en avoir

### Scenario: Un coordinateur sans équipe

* Given le coordinateur "Alan Turing"
* When je vérifie la présence de CRA v1 pour "Alan Turing"
* Then les CRA v1 sont "Presents"
