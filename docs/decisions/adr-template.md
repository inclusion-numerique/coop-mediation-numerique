---
status: "{proposed | rejected | accepted | deprecated | superseded by ADR-NNNN}"
date: AAAA-MM-JJ
decision-makers:
  - Prénom Nom
---

# Titre court qui énonce le problème résolu et la solution retenue

## Context and Problem Statement

Le problème à résoudre et les contraintes qui pèsent sur lui, tels qu'ils se présentaient au
moment de la décision. Citer les ADR antérieurs dont la décision dépend. Garder les seuls chiffres
qui ont pesé sur le choix.

## Decision Drivers

Facultatif. Les forces qui ont départagé les options, une par ligne.

## Considered Options

- Nom de l'option retenue
- Nom d'une autre option

## Decision Outcome

Option retenue : « Nom de l'option retenue », parce que … Une ou deux phrases qui énoncent la
décision dans son ensemble, puis une sous-section par règle.

### Première règle de la décision

Énoncer la règle et sa raison en termes métier ou d'architecture, sans nommer de code. Quand la
cible n'est pas atteinte : décrire l'état actuel, puis « Cible à atteindre, ticket à ouvrir ».

### Consequences

Ce que la décision rend possible et ce qu'elle coûte, côté positif comme côté négatif. Les limites
connues et les cibles non atteintes y figurent, sans calendrier.

### Confirmation

Facultatif. Comment on vérifie que la décision est respectée : linter, test, revue.

## Pros and Cons of the Options

### Nom d'une autre option

Ce qu'elle proposait et pourquoi elle a été écartée, en quelques phrases. Une sous-section par
option réellement envisagée.

## More Information

### Où trouver le détail

Les liens vers les abilities qui décrivent chaque comportement : ce sont elles qui font foi, et
les tests les jouent. Renvoyer au dossier des abilities d'une feature plutôt qu'à son code.

### Références

Documentation externe (API, normes, RFC), ADR antérieurs, conventions du dépôt. Un lien par ligne,
suivi d'une courte description si le titre ne suffit pas.

### Historique

| Date       | Auteur     | Action                      |
| ---------- | ---------- | --------------------------- |
| AAAA-MM-JJ | Prénom Nom | Rédaction initiale de l'ADR |
