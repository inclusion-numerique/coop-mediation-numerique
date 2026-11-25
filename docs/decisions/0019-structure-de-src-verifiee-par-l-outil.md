---
status: "accepted"
date: 2026-11-25
decision-makers:
  - Marc Gavanier
---

# La structure du code est vérifiée par l'outil

## Context and Problem Statement

L'[ADR-004](./0004-architecture-par-features-et-abilities.md) pose
l'arborescence des features et des abilities, et
l'[ADR-016](./0016-structure-du-depot.md) réduit le dépôt à un paquet
applicatif en quatre parties : app, features, libraries et configuration. Il
remettait les linters d'architecture à la fin de la restructuration.

La restructuration faite, la structure ne tenait encore que par les
conventions et la relecture. Rien n'empêchait un dossier mal nommé, un fichier
sans catégorie, un test jamais exécuté ou un fichier déposé à la racine d'un
dossier qui ne doit contenir que des dossiers. Ces écarts revenaient à chaque
lot de travail, en particulier dans le code produit par un agent.

## Decision Drivers

- Une règle qu'un outil peut vérifier va dans l'outil, pas dans une
  consigne.
- Le plus restrictif par défaut : ce qui n'est pas prévu est refusé.
- La règle doit se lire comme une donnée, en un seul fichier.

## Considered Options

- alint (option retenue)
- folderslint
- Les conventions et la relecture
- Un script maison

## Decision Outcome

Option retenue : « alint ».

alint vérifie la structure du code et de l'outillage de bout en bout, en
local et en CI, à partir d'un seul fichier de règles versionné.

### Les noms suivent une forme unique

Les dossiers sont en kebab-case. Les noms de fichiers suivent la forme
attendue dans chaque dossier : composants en PascalCase, le reste en
kebab-case.

### Chaque fichier a sa catégorie, au bon endroit

Dans une feature, la catégorie d'un fichier dit son rôle, et chaque dossier
n'accepte que ses catégories : un présentateur dans les présentateurs, une
validation dans les actions ou les formulaires, une requête dans une
implémentation. Les tests ont une catégorie à eux, et un test vit à côté de
ce qu'il teste.

### Les libraries et la configuration s'ouvrent par leurs entrées

Une library et un module de configuration exposent une racine en TypeScript
pur, chargeable partout, et une entrée par sujet de premier niveau. Une
entrée ne contient que des réexports nommés, sans code.

### Un dossier de dossiers ne contient pas de fichier

Les dossiers qui regroupent des sous-dossiers, comme les implémentations par
technique ou les tâches des jobs, n'ont aucun fichier à leur racine. Un
fichier déposé là n'a pas de place prévue : il est refusé.

### Les failles se cherchent en créant l'inattendu

Les règles se vérifient en créant des fichiers et des dossiers incongrus aux
endroits incongrus : chaque création qui passe est une faille, que l'on
ferme par une règle.

### Consequences

- Good, because la structure ne dépend plus de la relecture : un écart casse
  la CI.
- Good, because la règle se lit en un seul fichier, à côté du code.
- Good, because un agent qui crée un fichier au mauvais endroit est arrêté
  aussitôt.

- Bad, because alint est un outil jeune ; certaines vérifications de casse
  ne sont pas fiables et ont dû s'écrire par des motifs.
- Bad, because chaque nouvelle catégorie de fichier demande de modifier la
  règle avant le code.

### Confirmation

La commande de lint de la structure tourne dans la commande de lint
générale et dans la CI.

## Pros and Cons of the Options

### folderslint

Il ne vérifie que des chemins de dossiers autorisés. Il ne sait ni contrôler
la forme des noms de fichiers, ni exiger qu'une entrée soit sans code, ni
refuser un fichier vide.

### Les conventions et la relecture

C'était l'état d'avant. Les mêmes écarts revenaient d'un lot à l'autre, et la
relecture d'un gros diff les laissait passer.

### Un script maison

Il aurait fallu écrire, tester et maintenir un outil que d'autres ont déjà
fait.

## More Information

### Où trouver le détail

Les règles normatives sur l'arborescence sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).
Les règles vérifiées sont dans le [fichier de règles d'alint](../../.alint.yml).

### Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [ADR-016 : Un paquet applicatif et un paquet d'infrastructure](./0016-structure-du-depot.md)
- [alint](https://github.com/asamarts/alint)

### Historique

- 2026-11-25, Marc Gavanier : rédaction initiale de l'ADR.
