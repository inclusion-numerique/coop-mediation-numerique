---
status: "accepté"
date: 2026-11-17
decision-makers: Marc Gavanier
---

# Un paquet applicatif et un paquet d'infrastructure

## Contexte et problème

Le dépôt est un monorepo pnpm de plusieurs paquets : l'application Next, le CLI d'exploitation, du
code applicatif séparé en paquets, de l'outillage de test et de documentation des composants.
Turborepo orchestrait les tâches de ces paquets.

Plusieurs constats s'additionnaient :

- La découpe n'apporte rien de ce qu'un monorepo apporte d'ordinaire. Il n'y a qu'un produit, une
  seule personne développe, et aucun paquet n'est publié : les frontières entre paquets ne
  protègent aucune API externe.
- Le cache de Turborepo était désactivé sur toutes les tâches, sans cache distant, et la CI
  appelait pnpm directement. Turborepo n'accélérait rien.
- En mode strict, Turborepo exigeait de déclarer 96 variables d'environnement. Une variable
  oubliée n'atteignait pas la tâche, sans erreur.
- Chaque paquet a son manifeste, sa configuration TypeScript et ses scripts. Un changement
  transversal touche plusieurs paquets.

## Options envisagées

- Un paquet applicatif et un paquet d'infrastructure (option retenue)
- Garder le monorepo et Turborepo
- Garder les paquets sans Turborepo
- Poser les linters d'architecture tout de suite

## Décision

Option retenue : « Un paquet applicatif et un paquet d'infrastructure ».

Le dépôt se réduit à deux unités : un paquet applicatif et le module d'infrastructure. La
structure cible s'atteint par étapes, et les règles d'architecture ne sont outillées qu'une fois
cette structure atteinte.

### Deux unités : le paquet applicatif et le module d'infrastructure

Le paquet applicatif vit à la racine. Il s'organise en quatre parties : app, features, libraries
et configuration. Le module d'infrastructure est décrit en OpenTofu
([ADR-015](./0015-ci-github-actions-et-opentofu.md)).

Le dépôt n'a qu'un paquet pnpm, à la racine. Le module d'infrastructure reste à côté : il n'a pas
de dépendance npm à déclarer.

### La structure cible s'atteint en quatre étapes

1. Retirer Turborepo.
2. Remplacer l'ancienne infrastructure TypeScript par le module OpenTofu.
3. Fondre les paquets dans le paquet applicatif, par des renommages globaux des imports plutôt que
   fichier par fichier.
4. Ajouter des linters d'architecture une fois la structure atteinte.

Turborepo est retiré et le module OpenTofu remplace l'ancienne infrastructure. Les paquets
restent séparés : leur fusion dans le paquet applicatif est une cible à atteindre, ticket à
ouvrir.

### Tout nouveau code vise la structure cible

Un nouveau code s'écrit déjà comme s'il vivait dans le paquet applicatif, pour ne pas alourdir la
fusion à venir.

### Les linters d'architecture viennent en dernier

Posés avant la fin de la restructuration, ils resteraient rouges pendant des semaines, ou
demanderaient des exceptions qui en annulent l'intérêt. Aucun linter d'architecture n'est encore
posé : cible à atteindre, ticket à ouvrir.

### Conséquences

#### Positives

- Une seule configuration TypeScript, Biome et de tests pour l'application.
- Un composant, un e-mail ou une configuration se déplace sans changer de paquet.
- Plus de déclaration de variables d'environnement par tâche.
- Les frontières entre couches seront tenues par un linter, sur des règles explicites, plutôt que
  par des frontières de paquets.

#### Négatives

- La fusion des paquets touche une grande partie des imports. Elle produit des diffs volumineux,
  difficiles à relire, et des conflits avec les branches ouvertes au même moment.
- Tant que la fusion n'est pas faite, le dépôt garde la structure à paquets et ses configurations
  doublées. Cible à atteindre, ticket à ouvrir.
- Sans linter d'architecture d'ici là, le respect de la structure cible repose sur la relecture.
  Cible à atteindre, ticket à ouvrir.

## Avantages et inconvénients des options

### Garder le monorepo et Turborepo

Turborepo se justifie avec beaucoup de paquets, un cache distant et des équipes séparées. Aucune
de ces conditions n'est remplie. Le garder, c'est garder sa configuration et le piège des
variables d'environnement, sans gain mesurable.

### Garder les paquets sans Turborepo

Les paquets d'interface, d'e-mails et de configuration ne sont consommés que par l'application :
leurs frontières doublent les configurations et allongent les imports. Les règles de dépendance
qu'elles prétendent tenir se vérifient mieux par un linter d'architecture dans un seul paquet.

### Poser les linters d'architecture tout de suite

Un linter qui reste rouge n'est plus lu.

## Plus d'informations

### Où trouver le détail

- Le [fichier du workspace pnpm](../../pnpm-workspace.yaml) déclare les paquets du dépôt.

### Références

- [ADR-015 : CI sur GitHub Actions, infrastructure en HCL avec OpenTofu](./0015-ci-github-actions-et-opentofu.md)
- [Fichier du workspace pnpm](../../pnpm-workspace.yaml)

### Historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |
