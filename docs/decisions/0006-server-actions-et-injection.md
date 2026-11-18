---
status: "accepté"
date: 2026-11-17
decision-makers: Marc Gavanier
---

# Server actions et injection, à la place de tRPC

## Contexte et problème

Les mutations passaient par tRPC. L'application comptait 17 routeurs, la plupart dans un dossier
serveur central, quelques-uns dans des features. Chaque procédure portait au même endroit sa
validation, son contrôle d'accès et son accès à la base. Le client les appelait par un fournisseur
dédié.

Plusieurs défauts en découlaient :

- la logique métier vivait dans le routeur, pas dans une feature, et ne se testait qu'à travers
  lui ;
- une procédure pouvait renvoyer plus que nécessaire au navigateur : l'une d'elles rendait
  l'utilisateur de session entier, jetons OAuth compris ;
- tRPC doublait un mécanisme que Next fournit déjà : les server actions ;
- les composants clients importaient directement l'action qu'ils appelaient. Dans Storybook, cet
  import tirait le code serveur avec lui, et la story plantait.

Le découpage du code en features et en abilities, posé par
l'[ADR-004](./0004-architecture-par-features-et-abilities.md), donne une place à la logique
métier ; cet ADR décide comment une mutation l'atteint depuis l'interface.

## Options envisagées

- Server actions et injection, à la place de tRPC (option retenue)
- Garder tRPC
- Déclarer les server actions dans la page
- Importer l'action dans le composant client

## Décision

Option retenue : « Server actions et injection, à la place de tRPC ».

Toute mutation est une server action, construite de la même façon pour toutes les abilities, qui
compose l'ability sans rien décider elle-même. Les composants clients ne la connaissent pas : ils
la reçoivent par injection, et c'est la route qui la leur fournit.

### Une server action par mutation, construite par un constructeur commun

Toute mutation est une server action. Elle vit seule dans son fichier ; aucune server action n'est
déclarée en ligne dans une page ou une route.

L'action est construite par un constructeur commun, qui enchaîne dans l'ordre :

- le contrôle d'accès et le mode maintenance ;
- la validation de l'entrée par le schéma de l'ability, dont le type se propage jusqu'à l'appel
  client ;
- la traduction du résultat métier rendu par l'ability en réponse de l'action, chaque erreur
  métier devenant un message.

### L'action compose, l'ability décide

L'action ne contient aucune règle métier. La règle est dans l'ability, qui rend un résultat
discriminé, succès ou erreur métier, et non une exception. Une exception imprévue qui lui échappe
est signalée par le constructeur, qui rend un code d'erreur stable au client.

### Les contrats d'une mutation vivent dans l'ability

Une ability de mutation range ses contrats dans son dossier d'action : le schéma d'entrée, la
correspondance entre erreurs métier et messages, et la clé d'injection. Une ability de lecture n'a
pas de dossier d'action.

### Les composants clients reçoivent l'action par injection

Un composant client n'importe pas l'action. Il demande une clé à un conteneur d'injection, et la
route qui le monte lie cette clé à l'action réelle. Le conteneur client est distinct du conteneur
serveur.

Les clés se créent avec une fonction dédiée, qui en fait des symboles globaux : un symbole local ne
passe pas la frontière entre composant serveur et composant client.

### Conséquences

Positives :

- La logique métier est dans l'ability, testée par ses scénarios sur une base réelle. L'action
  n'est qu'une composition.
- L'entrée de l'action est typée jusqu'au client : un champ mal nommé à l'appel ne compile pas.
- Une exception imprévue est signalée côté serveur, au lieu d'être avalée en silence.
- Une story fournit une fausse action par le conteneur et n'importe jamais le code serveur.

Négatives :

- Une mutation demande plusieurs fichiers : l'action, ses contrats dans l'ability, et la liaison
  dans chaque route qui monte le composant.
- Une liaison oubliée dans une route ne se voit pas à la compilation, seulement à l'exécution ou
  dans les tests de bout en bout. De même, une clé créée sans la fonction dédiée passe dans les
  stories et casse en production.
- La clé est résolue à l'exécution : le lien entre un composant et son action n'est plus visible
  dans les imports.

## Avantages et inconvénients des options

### Garder tRPC

Il aurait fallu maintenir deux mécanismes de mutation, et un fournisseur client qui n'apporte rien
de plus que l'appel direct d'une server action.

### Déclarer les server actions dans la page

Une server action déclarée dans une route fabrique un point d'entrée ad hoc, sans schéma de
validation. Le schéma de l'action est la frontière : il doit exister, et être le même pour toutes
les routes qui appellent l'action.

### Importer l'action dans le composant client

C'est ce qui faisait planter les stories. Le mécanisme de simulation de modules de Storybook ne
règle pas le problème : il résout les chemins sans connaître l'alias de chemin du dépôt, qui
n'existe que pour TypeScript et le bundler.

## Plus d'informations

### Où trouver le détail

Les abilities de chaque feature décrivent les comportements que les actions exposent ; ce sont des
specs exécutables, jouées par les tests, et elles font foi. Les règles normatives sur les contrats
d'action, les erreurs métier, la route mince et l'injection sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md). Le
mode d'emploi court est dans la section « Server Actions » de [`AGENTS.md`](../../AGENTS.md).

### Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — conventions d'architecture des features
- [`AGENTS.md`](../../AGENTS.md) — section « Server Actions »

### Historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |
