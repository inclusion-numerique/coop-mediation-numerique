---
status: "accepted"
date: 2026-11-17
decision-makers:
  - Marc Gavanier
---

# CI sur GitHub Actions, infrastructure en HCL avec OpenTofu

## Context and Problem Statement

La CI et les déploiements tournaient sur CircleCI. L'infrastructure était décrite en TypeScript
avec CDKTF.

Plusieurs problèmes s'additionnaient :

- CDKTF est archivé. Il imposait Node 22 aux jobs de déploiement et tirait une dépendance qui
  suit une version de TypeScript en développement.
- Les checks vivaient hors de GitHub : les règles de fusion ne pouvaient pas s'y appuyer.
- Des contrôles étaient inopérants côté CircleCI, par exemple la vérification de la
  spécification OpenAPI.
- Une preview se déclenchait par une approbation manuelle, hors de la PR.

Le dépôt est hébergé sur GitHub. Une seule personne développe et opère l'application.

## Considered Options

- CI sur GitHub Actions, infrastructure en HCL avec OpenTofu (option retenue)
- Rester sur CircleCI
- Approuver la preview par un environnement protégé
- Cypress Cloud
- Pulumi en TypeScript
- Terraform

## Decision Outcome

Option retenue : « CI sur GitHub Actions, infrastructure en HCL avec OpenTofu ».

La CI, les déploiements et les règles de fusion passent tous par GitHub. L'infrastructure est
décrite en HCL et appliquée par OpenTofu, avec des plans approuvés au moment de la release.

### La CI et les déploiements sur GitHub Actions

- **La CI** tourne à chaque push sur une branche de travail et sur la branche principale. Sur
  celle-ci, elle entretient les références de couverture et de Chromatic.
- **La release** tourne à chaque fusion dans la branche principale. Elle construit dev et la
  production en parallèle, déploie dev, puis la production si dev a réussi.
- **La preview** déploie l'environnement d'une branche quand la PR porte le label preview.
  Retirer le label, fermer ou fusionner la PR le détruit ; une destruction manuelle reste
  possible.
- Les étapes communes sont factorisées en workflows réutilisables et en actions composites.

Il n'y a plus de branche dev : les branches partent de la branche principale et y reviennent.
L'environnement dev reste, déployé avant la production.

### Les règles de fusion tenues par des rulesets

Sur la branche principale, une PR n'est fusionnée qu'en squash, avec des commits signés, un
historique linéaire, une branche à jour et les checks requis passés.

Sur les branches de travail, seuls les commits signés sont exigés.

Le squash est le seul mode de fusion parce que GitHub ne signe pas les commits qu'il rebase.

### L'infrastructure en HCL, appliquée par OpenTofu

L'infrastructure décrit chaque environnement (production, dev, previews) en HCL. OpenTofu
l'applique sur Scaleway. La migration a repris les adresses des ressources CDKTF et la même clé
d'état : les états existants ont été repris sans rien recréer.

### Les plans d'infrastructure approuvés à la release

La release planifie l'infrastructure pendant les builds. Tout changement réel de
l'infrastructure, au-delà des seules marques de sensibilité des valeurs, fait attendre le
déploiement jusqu'à une approbation sur un environnement dédié. Le plan se lit dans le résumé du
run.

Dans une branche qui modifie l'infrastructure, la CI publie les plans de dev et de la production.
On voit l'effet d'un changement avant la fusion, et on l'approuve au moment où il s'applique.

### La preview pilotée par un label

Poser le label déploie ; chaque push redéploie tant que le label est là. C'est le modèle courant
dans l'écosystème (PullPreview, Cloud Posse).

### Consequences

**Positives**

- Un seul outil pour le code, la CI, les règles de fusion et les déploiements.
- Pas de fusion sans les checks requis, ni avec une branche en retard sur la branche principale.
- Une preview se demande depuis la PR, sans approbation.
- Un changement d'infrastructure est visible dans la PR et approuvé à la release.
- Les jobs de déploiement sont revenus à Node 24, et la dépendance à une version de TypeScript en
  développement a disparu.

**Négatives ou à surveiller**

- **Les workflows et les actions composites sont du code à maintenir**, avec des scripts dans du
  YAML.
- **L'approbation de l'infrastructure repose sur une seule personne** : en son absence, la release
  reste bloquée.
- **Le mode strict oblige à remettre la branche à jour** à chaque fusion dans la branche
  principale, ce qui relance toute la CI.
- **Le plan de CI d'une branche lit les états réels** : il a besoin des secrets Scaleway.
- **Certains pièges d'OpenTofu ne se voient pas dans le JSON du plan** : un script les filtre.

## Pros and Cons of the Options

### Rester sur CircleCI

Les checks seraient restés hors de GitHub, et CDKTF aurait dû être remplacé de toute façon.
Centraliser sur l'hébergeur du code supprime un fournisseur, ses jetons et son registre d'images.

### Approuver la preview par un environnement protégé

Essayé, puis remplacé par le label. Le run restait bloqué tant que personne ne décidait, ses jobs
échoués ne pouvaient plus être relancés, et chaque push enregistrait un faux déploiement.

### Cypress Cloud

Écarté au profit d'une répartition des tests de bout en bout sur plusieurs conteneurs, guidée par
un fichier de durées tenu à la main, sans service externe supplémentaire.

### Pulumi en TypeScript

HCL permettait de reprendre les états CDKTF tels quels. Avec Pulumi, il aurait fallu importer
chaque ressource dans un nouvel état.

### Terraform

Le langage est le même. OpenTofu est sous licence libre (MPL) et sous l'égide de la Linux
Foundation, alors que Terraform est passé sous licence BUSL en 2023.

## More Information

### Où trouver le détail

- Le [README d'infrastructure](../../infrastructure/README.md#deploiement) décrit le déroulé
  d'une release, l'approbation des changements d'infrastructure et la destruction d'une preview.
- La [section CI/CD du guide de contribution](../../CONTRIBUTING.md#ci-cd) décrit ce que fait
  chaque workflow et comment demander une preview.

### Références

- [README d'infrastructure, déploiement](../../infrastructure/README.md#deploiement)
- [Guide de contribution, intégration et déploiement continus](../../CONTRIBUTING.md#ci-cd)

### Historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |
