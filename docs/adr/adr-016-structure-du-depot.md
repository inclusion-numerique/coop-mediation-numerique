# ADR-016 : Un paquet applicatif et un paquet d'infrastructure

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                           |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| 2026-10-07 | Marc Gavanier | Décision de la structure cible : un paquet applicatif, un paquet d'infrastructure, sans Turborepo                |
| 2026-10-07 | Marc Gavanier | Turborepo retiré au profit des espaces de travail pnpm ; `packages/lint` quitte le workspace (`caa727c02`, #668) |
| 2026-10-07 | Marc Gavanier | `infrastructure/` en HCL remplace `packages/cdk` (`968e6efe2`, #669)                                             |
| 2026-11-17 | Marc Gavanier | Ordre de la restructuration fixé : ménage de la racine (#734), fusion des paquets, puis ménage de `src`          |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                        |

## Statut

Accepté — en cours. Turborepo est retiré et `infrastructure/` remplace `packages/cdk`. La fusion des
paquets dans un paquet applicatif unique reste à faire.

## Contexte

Le dépôt est un monorepo pnpm. Au 17/11/2026, `pnpm-workspace.yaml` déclare huit paquets :

- `apps/web` : l'application Next.js ;
- `apps/cli` : le CLI d'exploitation ;
- `packages/config`, `packages/ui`, `packages/emails` : du code de l'application, séparé en
  paquets ;
- `packages/fixtures`, `packages/storybook`, `packages/e2e` : l'outillage de test et de
  documentation des composants.

Jusqu'au 07/10/2026, Turborepo orchestrait les tâches de ces paquets et `packages/cdk` décrivait
l'infrastructure.

Cette découpe ne sert à rien de ce qu'un monorepo apporte d'ordinaire :

- Il n'y a qu'un produit. Tous les paquets servent l'application web ou son exploitation.
- Une seule personne développe. Il n'y a pas d'équipes dont il faudrait séparer le code.
- Aucun paquet n'est publié. Les frontières entre paquets ne protègent aucune API externe.

Elle coûte en revanche :

- Le cache de Turborepo était désactivé sur toutes les tâches, sans cache distant, et la CI
  appelait pnpm directement. Turborepo n'accélérait rien.
- En mode strict, Turborepo exigeait de déclarer 96 variables d'environnement. Une variable oubliée
  n'atteignait pas la tâche, sans erreur.
- Chaque paquet a son `package.json`, sa configuration TypeScript et ses scripts. Un changement
  transversal touche plusieurs paquets. Un composant passe d'un paquet à l'autre par des imports
  `@app/...`.

## Décision

Le dépôt vise deux unités :

- **un paquet applicatif à la racine**, organisé en `src/app`, `src/features`, `src/libraries` et
  `src/configuration` ;
- **`infrastructure/`**, le module OpenTofu de l'infrastructure ([ADR-015](./adr-015-ci-github-actions-et-opentofu.md)).

Le dépôt n'a plus qu'un paquet pnpm, à la racine. `infrastructure/` reste à côté : c'est un module OpenTofu, sans dépendance npm à déclarer.

La décision s'applique par étapes :

1. Retirer Turborepo. Les scripts de la racine passent par `pnpm -r`, qui suit l'ordre des
   dépendances entre paquets. Fait (#668).
2. Remplacer `packages/cdk` par `infrastructure/`. Fait (#669).
3. Fondre `packages/*` et `apps/*` dans le paquet applicatif. Les chemins se renomment par des
   changements globaux sur tous les imports, pas fichier par fichier. À faire.
4. Ajouter les linters d'architecture (dependency-cruiser, folderslint) une fois la structure
   atteinte. À faire.

Tout nouveau code vise déjà la structure cible.

Les linters d'architecture viennent en dernier volontairement. Posés avant la fin de la
restructuration, ils resteraient rouges pendant des semaines, ou devraient être assortis
d'exceptions qui en annulent l'intérêt.

## Alternatives écartées

### Garder le monorepo et Turborepo

Turborepo se justifie avec beaucoup de paquets, un cache distant et des équipes séparées. Aucune de
ces conditions n'est remplie. Le garder, c'est garder sa configuration et le piège des variables
d'environnement sans aucun gain mesurable.

### Garder les paquets sans Turborepo

C'est l'état intermédiaire actuel. Les paquets `ui`, `emails` et `config` ne sont consommés que par
l'application : leurs frontières ne font que doubler les configurations et allonger les imports.
Les règles de dépendance qu'elles prétendent tenir se vérifient mieux par un linter d'architecture
dans un seul paquet.

### Poser les linters d'architecture tout de suite

Écarté pour la raison donnée plus haut : un linter qui reste rouge n'est plus lu.

## Conséquences

### Positives

- Une seule configuration TypeScript, Biome et de tests pour l'application.
- Un composant, un e-mail ou une configuration se déplace sans changer de paquet.
- Plus de déclaration de variables d'environnement par tâche.
- Les frontières entre couches seront tenues par un linter, sur des règles explicites, plutôt que
  par des frontières de paquets.

### Négatives

- La fusion des paquets touche une grande partie des imports du dépôt. Elle produira des diffs
  volumineux, difficiles à relire, et des conflits avec les branches ouvertes au même moment.
- Tant que la fusion n'est pas faite, le dépôt garde la structure à paquets, avec ses
  configurations doublées.
- Sans linter d'architecture d'ici là, le respect de la structure cible repose sur la relecture.

## Références

- `pnpm-workspace.yaml`
- [ADR-015](./adr-015-ci-github-actions-et-opentofu.md) : infrastructure en HCL avec OpenTofu

## ADR liés

- [ADR-004 : Architecture par features et abilities](./adr-004-architecture-par-features-et-abilities.md)
- [ADR-007 : `app/` ne contient que le routage Next](./adr-007-app-ne-contient-que-le-routage.md)
- [ADR-015 : CI sur GitHub Actions, infrastructure en HCL avec OpenTofu](./adr-015-ci-github-actions-et-opentofu.md)
