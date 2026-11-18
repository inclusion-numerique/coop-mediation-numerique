---
status: "accepted"
date: 2026-11-17
decision-makers:
  - Marc Gavanier
---

# Formulaires avec TanStack Form

## Context and Problem Statement

Les formulaires reposaient sur react-hook-form, avec une enveloppe par type de champ dans le
paquet d'interface. Chaque enveloppe reliait le composant du système de design au moteur de
formulaire, et le schéma Zod se branchait par un résolveur.

Chaque nouveau champ demandait une enveloppe de plus dans ce paquet, hors de la feature qui
l'utilise. Cela allait contre l'organisation par features et abilities posée par l'ADR-004, où
une feature porte ce dont elle a besoin.

## Considered Options

- Formulaires avec TanStack Form (option retenue)
- Garder react-hook-form
- Migrer tous les formulaires d'un coup

## Decision Outcome

Option retenue : « Formulaires avec TanStack Form ».

Tout nouveau formulaire se construit avec la bibliothèque maison basée sur TanStack Form. Le
formulaire dérive son type du schéma de validation, et la validation n'intervient qu'à la
soumission.

### Une bibliothèque maison pour tout nouveau formulaire

La bibliothèque porte des adaptateurs de champ, qui enveloppent les composants du système de
design, un bouton de soumission, et le lien entre la soumission et une server action (ADR-006).
Un formulaire n'a besoin de rien d'autre.

### La logique entre champs passe par le store du formulaire

Un champ qui dépend de la valeur d'un autre s'abonne au store du formulaire. Un champ qui doit
modifier un autre champ le fait par un écouteur de changement posé sur le champ concerné.

### La validation se pose à la soumission

La validation se déclenche à la soumission, pour ne pas afficher d'erreur avant la première
soumission.

### Le type de la valeur est celui de l'entrée du validateur

Le type de la valeur du formulaire est celui de l'entrée du validateur. Quand le formulaire porte
un champ que le schéma partagé n'a pas, on étend le schéma localement, dans le formulaire, sans
toucher au schéma de l'action.

### Une seule exception à l'interdiction des forçages de type

La signature de la bibliothèque impose un forçage de type pour déclarer le type des valeurs par
défaut et des propriétés d'un sous-formulaire : ces options ne portent qu'un type, leur valeur
n'est jamais lue. C'est la seule exception tolérée à l'interdiction des forçages de type.

### Consequences

Positives :

- Un formulaire migré n'utilise que la bibliothèque maison, sans enveloppe dans le paquet
  d'interface.
- Un écart entre le type de la valeur du formulaire et l'entrée du validateur se voit à la
  compilation.

Négatives :

- Deux moteurs de formulaire coexistent tant que la migration n'est pas finie, et react-hook-form
  reste une dépendance. Cible à atteindre, ticket à ouvrir : tous les formulaires sur TanStack
  Form et react-hook-form retiré des dépendances.
- Le texte riche charge encore l'ancien moteur : sa barre d'outils embarque une modale de lien
  écrite avec react-hook-form.
- Les adaptateurs n'ont pas tous la surface des anciens champs. Par exemple, un champ numérique
  vidé émet une chaîne vide, qu'un écouteur du formulaire doit ramener à null pour que la
  validation la traite comme une valeur absente.

## Pros and Cons of the Options

### Garder react-hook-form

Il aurait fallu conserver les enveloppes du paquet d'interface et leurs contrôleurs. La migration
était engagée avec la saisie d'activité : la poursuivre évite de garder deux façons d'écrire un
formulaire neuf.

### Migrer tous les formulaires d'un coup

Un formulaire passe à TanStack Form quand sa feature est reprise, ability par ability, pas dans
une passe transverse.

## More Information

### Où trouver le détail

Les abilities de la feature bénéficiaire dont les formulaires sont passés à TanStack Form
décrivent le comportement attendu, et font foi :

- [Créer un bénéficiaire](../../src/features/beneficiaire/abilities/creer-beneficiaire/creer-beneficiaire.ability.md)
- [Modifier un bénéficiaire](../../src/features/beneficiaire/abilities/modifier-beneficiaire/modifier-beneficiaire.ability.md)
- [Importer des bénéficiaires](../../src/features/beneficiaire/abilities/importer-beneficiaires/importer-beneficiaires.ability.md)

Les règles normatives sur les formulaires sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).

### Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [ADR-006 : Server actions et injection, à la place de tRPC](./0006-server-actions-et-injection.md)
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — formulaires et exception aux forçages de type
- [TanStack Form](https://tanstack.com/form/latest)

### Historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |
