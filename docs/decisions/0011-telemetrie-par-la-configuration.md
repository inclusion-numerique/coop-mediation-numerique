---
status: "accepté"
date: 2026-11-17
decision-makers: Marc Gavanier
---

# Télémétrie isolée dans la configuration

## Contexte et problème

### Sentry importé partout

Sentry était importé directement dans toute l'application : features, bibliothèques, adaptateurs,
routes, jobs, composants. Juste avant la migration, une quarantaine de fichiers l'importaient.

### Un comportement qui dépendait du contexte d'exécution

Sous Next, la fonction de signalement de Sentry existait. Hors de Next, par exemple dans un job
lancé en local, elle n'existait pas : l'appel levait une erreur dans le bloc de rattrapage, qui
masquait l'erreur d'origine et faisait planter le job. Un job de synchronisation RDV Service
Public lancé en local échouait ainsi, et cachait la vraie cause : un nom d'hôte non résolu.

### Une parade qui perdait des erreurs

La parade fut de rendre l'appel optionnel partout. Elle évitait le plantage, mais une erreur
pouvait alors disparaître sans laisser de trace.

### Des tests qui devaient remplacer Sentry

Un module qui importe Sentry ne se teste qu'en remplaçant ce module. Cela va contre la règle de
tests posée par l'[ADR-008](./0008-strategie-de-tests.md) : ni mock de module, ni espion.

## Options envisagées

- Télémétrie isolée dans la configuration (option retenue)
- Garder l'appel optionnel à Sentry partout

## Décision

Option retenue : « Télémétrie isolée dans la configuration ».

Sentry n'est connu que de la configuration, qui choisit une implémentation de télémétrie par
environnement. Le reste de l'application dépend d'interfaces neutres, prises dans la configuration
par les racines de composition et reçues par injection partout ailleurs.

### Un seul dossier importe Sentry

Un seul dossier de configuration importe Sentry et l'initialise. Le reste de l'application dépend
d'interfaces de télémétrie neutres, qui ne disent rien de l'outil qui les implémente.

### Une implémentation par environnement, choisie par une variable d'environnement

Le signalement d'erreurs a une implémentation par environnement : Sentry en production, la console
en développement, rien en CI. Une variable d'environnement choisit la variante. Elle est générée à
l'installation et régénérée au build, qui livre la variante de production.

### Les racines de composition prennent le signaleur, le reste le reçoit

Les racines de composition prennent le signaleur d'erreurs dans la configuration. Le domaine, la
logique d'interface et les bibliothèques reçoivent ce dont ils ont besoin par injection.

Le constructeur d'actions de l'[ADR-006](./0006-server-actions-et-injection.md) reçoit le
signaleur en option ; la configuration lui fournit le sien.

### Les appels externes sont signalés à un seul endroit

Un appel à un service externe est enveloppé dans la configuration de ce service. Un échec y est
signalé une fois : les features qui l'appellent n'ont pas à le signaler elles-mêmes.

### Conséquences

Positives :

- Un job lancé hors de Next ne peut plus planter à cause de Sentry : en développement, l'erreur va
  à la console.
- Les tests n'ont plus à remplacer Sentry.
- La CI n'envoie rien à Sentry.
- Changer d'outil de signalement ne touche que le dossier de télémétrie.

Négatives :

- Le fichier de variante n'existe pas dans un clone neuf tant que la génération n'a pas tourné.
  L'installation le fait ; une variable d'environnement mal positionnée au build livrerait la
  mauvaise variante.
- Le module de log de la bibliothèque de télémétrie importe pino d'office, alors qu'il le déclare
  optionnel : pino a dû rejoindre les dépendances du web.
- Retirer Sentry a privé le paquet de fixtures des types globaux de Next, qui lui arrivaient par
  Sentry : next a rejoint ses dépendances.
- Quelques modules hors des racines de composition importent encore le signaleur directement au
  lieu de le recevoir par injection. Cible à atteindre, ticket à ouvrir.

## Avantages et inconvénients des options

### Garder l'appel optionnel à Sentry partout

Il empêchait le plantage hors de Next, mais au prix d'un signalement perdu sans bruit. Et il
laissait Sentry importé partout, donc remplacé partout dans les tests.

## Plus d'informations

### Où trouver le détail

Le mode d'emploi de la télémétrie, ses variantes et la façon de les générer sont dans la section
« Telemetry » d'[`AGENTS.md`](../../AGENTS.md). Les règles normatives sur l'injection et les tests
sans mock sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).

### Références

- [ADR-006 : Server actions et injection, à la place de tRPC](./0006-server-actions-et-injection.md)
- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./0008-strategie-de-tests.md)
- [`AGENTS.md`](../../AGENTS.md) — section « Telemetry »
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — conventions d'architecture des features

### Historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |
