# ADR-015 : CI sur GitHub Actions, infrastructure en HCL avec OpenTofu

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                          |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-30 | Marc Gavanier | Premier lot sur GitHub Actions : lint, tests unitaires et couverture (#639)                                                     |
| 2026-10-05 | Marc Gavanier | Lots 2 et 3 : intégration, Cucumber, Chromatic, tests de composants et E2E (#641, #643)                                         |
| 2026-10-05 | Marc Gavanier | Lot 4 : build, déploiements et suppression des previews ; suppression de `.circleci/config.yml` (`2abe52cdb`, #644)             |
| 2026-10-06 | Marc Gavanier | Fusion directe dans `main`, l'environnement `dev` étant gardé (`ea2a11d7a`) ; ruleset `main` et ruleset des branches de travail |
| 2026-10-06 | Marc Gavanier | Preview pilotée par le label `preview` au lieu d'une approbation (`7f18da816`, #659)                                            |
| 2026-10-06 | Marc Gavanier | Les checks tournent aussi sur `main`, pour la couverture et Chromatic (`78bf5ca6b`, #661)                                       |
| 2026-10-07 | Marc Gavanier | Infrastructure en HCL avec OpenTofu, `packages/cdk` supprimé ; plans approuvés à la release (`968e6efe2`, #669)                 |
| 2026-10-13 | Marc Gavanier | Namespace et mot de passe de base uniques par preview (`7fa457f25`, #677) ; check `Lint PR title` ajouté au ruleset `main`      |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                       |

## Statut

Accepté — en place. CircleCI et CDKTF ne sont plus utilisés.

## Contexte

Jusqu'en septembre 2026, la CI et les déploiements tournaient sur CircleCI. L'infrastructure était
décrite en TypeScript avec CDKTF, dans le paquet `packages/cdk`.

Plusieurs problèmes s'additionnaient :

- CDKTF est archivé. Il imposait Node 22 aux jobs de déploiement et tirait `jsii`, dont une
  dépendance suit le tag mobile `typescript@next`.
- Les checks vivaient hors de GitHub. Les règles de fusion ne pouvaient pas s'y appuyer
  directement.
- Le passage en lots a révélé des contrôles inopérants côté CircleCI, par exemple la vérification
  de la spécification OpenAPI.
- Une preview se déclenchait par une approbation manuelle dans CircleCI, hors de la PR.

Le dépôt est déjà hébergé sur GitHub. Une seule personne développe et opère l'application.

## Décision

### La CI et les déploiements sur GitHub Actions

Tout passe par les workflows de `.github/workflows/`. Leur fonctionnement détaillé est décrit dans
[`infrastructure/README.md`](../../infrastructure/README.md#deploiement) et dans le
[guide de contribution](../../CONTRIBUTING.md#ci-cd). En résumé :

- **CI** tourne à chaque push sur une branche de travail (préfixes conventionnels) et sur `main`.
  Sur `main`, il entretient les références de couverture et de Chromatic.
- **Release** tourne à chaque fusion dans `main`. Il construit les images de `dev` et de la
  production en parallèle, déploie `dev`, puis la production si `dev` a réussi.
- **Preview** déploie l'environnement d'une branche quand la PR porte le label `preview`. Retirer
  le label, fermer ou fusionner la PR le détruit.
- **Remove ephemeral environment** détruit une preview. Preview l'appelle ; on peut aussi le lancer
  à la main ou depuis le CLI.
- Les étapes communes sont factorisées : workflows réutilisables (`build`, `deploy`,
  `infrastructure-plan`) et actions composites (`.github/actions/`).

Il n'y a plus de branche `dev` : les branches partent de `main` et y reviennent. L'environnement
`dev` reste, déployé à chaque release avant la production.

### Les règles de fusion tenues par des rulesets

Le ruleset `main` exige :

- une PR, fusionnée en squash seulement ;
- des commits signés et un historique linéaire ;
- une branche à jour avec `main` avant la fusion ;
- douze checks : `Lint`, `Test packages`, `Test web`, `Integration tests`, `Cucumber`,
  `Components`, `E2E 0`, `E2E 1`, `E2E 2`, `Dependency review`, `Lint commits`, `Lint PR title`.

Le ruleset des branches de travail n'exige que des commits signés.

Le squash est le seul mode de fusion parce que GitHub ne signe pas les commits qu'il rebase.

### L'infrastructure en HCL, appliquée par OpenTofu

`infrastructure/` décrit chaque environnement (`main`, `dev`, previews) en HCL. OpenTofu
l'applique sur Scaleway. La migration reprend les ressources sous leurs adresses CDKTF, avec la même
clé d'état par environnement : OpenTofu a repris les états existants sans rien recréer.

### Les plans d'infrastructure approuvés à la release

Release planifie l'infrastructure de chaque environnement pendant les builds. Si un plan change
autre chose que les marques de sensibilité de l'état, le déploiement attend une approbation sur
l'environnement GitHub `infrastructure-approval`. Le plan se lit dans le résumé du run.

Dans une branche qui modifie `infrastructure/`, CI publie le plan de `dev` et de la production.
On voit donc l'effet d'un changement avant la fusion, et on l'approuve au moment où il s'applique.

### La preview pilotée par un label

Poser le label `preview` déploie ; chaque push redéploie tant que le label est là. C'est le modèle
courant dans l'écosystème GitHub (PullPreview, Cloud Posse).

## Alternatives écartées

### Rester sur CircleCI

Les checks seraient restés hors de GitHub, et CDKTF aurait dû être remplacé de toute façon.
Centraliser sur l'hébergeur du code supprime un fournisseur, ses jetons et son registre d'images.

### Approuver la preview par un environnement protégé

Essayé le 06/10/2026 (#648), puis remplacé par le label (#659). L'environnement protégé est prévu
pour les mises en production. Le run restait bloqué tant que personne ne décidait, ses jobs échoués
ne pouvaient plus être relancés, et chaque push enregistrait un faux déploiement.

### Cypress Cloud pour répartir les E2E

Écarté au lot 3 : les E2E sont répartis sur trois conteneurs d'une matrice GitHub, avec
`cypress-split`, sans service externe supplémentaire. La répartition s'appuie sur
`packages/e2e/timings.json`, mis à jour à la main.

### Pulumi en TypeScript

La cartographie nationale, dépôt voisin de l'ANCT, décrit son infrastructure avec Pulumi. Le
choix restait ouvert le 07/10/2026. HCL permettait de reprendre les états CDKTF tels quels : CDKTF
produit déjà du Terraform, et les ressources gardent leurs adresses. Avec Pulumi, il aurait fallu
importer chaque ressource dans un nouvel état.

### Terraform plutôt qu'OpenTofu

Le langage est le même. OpenTofu est le fork sous licence libre (MPL), maintenu sous l'égide de la
Linux Foundation, alors que Terraform est passé sous licence BUSL en 2023.

## Conséquences

### Positives

- Un seul outil pour le code, la CI, les règles de fusion et les déploiements.
- Une PR ne peut pas être fusionnée sans les douze checks, ni avec une branche en retard sur `main`.
- Une preview se demande depuis la PR, sans approbation et sans quitter GitHub.
- Un changement d'infrastructure est visible dans la PR et approuvé à la release, au moment où il
  s'applique.
- Les jobs de déploiement sont revenus à Node 24. La dépendance à `typescript@next` via `jsii` a
  disparu.

### Négatives

- Les workflows et les actions composites sont du code à maintenir : une partie des scripts vit dans
  du YAML.
- L'approbation `infrastructure-approval` repose sur une seule personne. En son absence, une
  release qui change l'infrastructure reste bloquée.
- Le mode strict des checks oblige à remettre une branche à jour à chaque fusion dans `main`, et
  relance alors toute la CI.
- Le plan de CI d'une branche lit les états réels de `dev` et de la production : il a besoin des
  secrets Scaleway.
- Certains pièges d'OpenTofu ne se voient pas dans le JSON du plan, comme une mise à jour qui ne
  change que les marques de sensibilité. `.github/scripts/infrastructure-plan-check.py` les filtre.

## Références

- [`infrastructure/README.md`](../../infrastructure/README.md)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md#ci-cd)
- `.github/workflows/`, `.github/actions/`, `.github/scripts/infrastructure-plan-check.py`
- [ADR-016](./adr-016-structure-du-depot.md) : `infrastructure/` remplace `packages/cdk`

## ADR liés

- [ADR-014 : Migrations destructives en deux temps](./adr-014-migrations-destructives-en-deux-temps.md)
- [ADR-016 : Un paquet applicatif et un paquet d'infrastructure](./adr-016-structure-du-depot.md)
- [ADR-017 : Chaîne d'approvisionnement des dépendances](./adr-017-chaine-d-approvisionnement.md)
