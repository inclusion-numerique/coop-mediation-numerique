---
status: "accepted"
date: 2026-11-25
decision-makers:
  - Marc Gavanier
---

# Documentation générée et publiée

## Context and Problem Statement

Les décisions vivent dans les ADR, les comportements dans les spécifications
exécutables de chaque ability, et l'architecture dans les règles vérifiées
par l'outil ([ADR-019](./0019-structure-de-src-verifiee-par-l-outil.md),
[ADR-020](./0020-imports-bornes-par-l-outil.md)). Tout cela se lit dans le
dépôt, fichier par fichier, mais rien ne le rassemble.

L'outillage sait déjà produire bien plus : les graphes de dépendances, le
rapport des imports, l'analyse du bundle, la couverture des tests. Ces
sorties restaient dans les journaux de la CI ou sur le poste de qui les
lançait.

## Decision Drivers

- Ne pas développer un nouveau projet : un outil prêt à l'emploi, qui se
  configure.
- Une mise en forme soignée sans travail de design.
- Rien d'écrit à la main qui puisse dériver : tout se génère depuis le dépôt.

## Considered Options

- Starlight (option retenue)
- VitePress
- MkDocs Material
- Une page maison

## Decision Outcome

Option retenue : « Starlight ».

Un site de documentation est généré depuis le dépôt et publié sur GitHub
Pages à chaque fusion sur la branche principale.

### Le site rassemble ce que le dépôt sait déjà

- Les ADR.
- Les spécifications exécutables, rangées par feature et par ability.
- L'architecture : un graphe des dépendances par feature, les imports admis
  rendus en tableaux, le rapport des imports.
- Les rapports de l'outillage : l'analyse du bundle, la couverture des tests
  unitaires.

La spécification de l'API et le schéma de la base viendront ensuite. Cible à
atteindre, ticket à ouvrir.

### Les sources restent intactes

Les ADR et les spécifications ne changent pas pour le site. Une étape de
collecte les rassemble et leur donne ce que le générateur attend, comme un
titre. Rien de généré n'est versionné.

### La publication suit la branche principale

Le site se construit et se publie à chaque fusion, jamais depuis une branche
de travail. Un échec de la documentation n'empêche pas la mise en
production.

### Consequences

- Good, because tout le savoir du dépôt se lit au même endroit, avec une
  recherche et des diagrammes.
- Good, because la documentation ne peut pas dériver du code : elle en est
  tirée.
- Good, because les rapports de l'outillage restent consultables après la
  CI.

- Bad, because le site ajoute une dépendance de génération et un job de CI à
  entretenir.
- Bad, because le dépôt est public, et le site aussi : il ne doit rien
  publier que le dépôt ne montre déjà.

## Pros and Cons of the Options

### VitePress

Il rend le Markdown sans exiger de titre en en-tête, mais l'extension qui
affiche les diagrammes n'est plus maintenue, et les ADR en contiennent.

### MkDocs Material

Il est passé en maintenance ; son successeur n'a pas encore de version
stable. Il demande aussi un environnement Python dans la CI.

### Une page maison

C'est le plus simple à publier, mais sans mise en forme, sans navigation ni
recherche, à moins de développer tout cela soi-même.

## More Information

### Où trouver le détail

Les commandes de génération sont décrites dans [`AGENTS.md`](../../AGENTS.md).

### Références

- [ADR-019 : La structure du code est vérifiée par l'outil](./0019-structure-de-src-verifiee-par-l-outil.md)
- [ADR-020 : Les imports sont bornés par l'outil](./0020-imports-bornes-par-l-outil.md)
- [Starlight](https://starlight.astro.build/)
- [GitHub Pages](https://docs.github.com/pages)

### Historique

- 2026-11-25, Marc Gavanier : rédaction initiale de l'ADR.
