---
status: "accepted"
date: 2026-11-25
decision-makers:
  - Marc Gavanier
---

# Télémétrie isolée dans la configuration

## Context and Problem Statement

### Sentry importé partout

Sentry était importé directement dans toute l'application : features,
bibliothèques, adaptateurs, routes, jobs, composants. Juste avant la migration,
une quarantaine de fichiers l'importaient.

### Un comportement qui dépendait du contexte d'exécution

Sous Next, la fonction de signalement de Sentry existait. Hors de Next, par
exemple dans un job lancé en local, elle n'existait pas : l'appel levait une
erreur dans le bloc de rattrapage, qui masquait l'erreur d'origine et faisait
planter le job. Un job de synchronisation RDV Service Public lancé en local
échouait ainsi, et cachait la vraie cause : un nom d'hôte non résolu.

### Une parade qui perdait des erreurs

La parade fut de rendre l'appel optionnel partout. Elle évitait le plantage,
mais une erreur pouvait alors disparaître sans laisser de trace.

### Des tests qui devaient remplacer Sentry

Un module qui importe Sentry ne se teste qu'en remplaçant ce module. Cela va
contre la règle de tests posée par l'[ADR-008](./0008-strategie-de-tests.md) :
ni mock de module, ni espion.

## Considered Options

- Télémétrie isolée dans la configuration (option retenue)
- Garder l'appel optionnel à Sentry partout

## Decision Outcome

Option retenue : « Télémétrie isolée dans la configuration ».

Sentry n'est connu que de la configuration, qui choisit une implémentation de
télémétrie par environnement. Le reste de l'application dépend d'interfaces
neutres, prises dans la configuration par les racines de composition et reçues
par injection partout ailleurs.

### Un seul dossier importe Sentry

Un seul dossier de configuration importe Sentry et l'initialise. Le reste de
l'application dépend d'interfaces de télémétrie neutres, qui ne disent rien
de l'outil qui les implémente.

### Une implémentation par environnement, choisie par une variable d'environnement

Le signalement d'erreurs a une implémentation par environnement : Sentry en
production, la console en développement, rien en CI. Une variable
d'environnement choisit la variante. Elle est générée à l'installation et
régénérée au build, qui livre la variante de production.

### Les racines de composition prennent le signaleur, le reste le reçoit

Les racines de composition prennent le signaleur d'erreurs dans la
configuration. Le domaine, la logique d'interface et les bibliothèques
reçoivent ce dont ils ont besoin par injection.

Le constructeur d'actions de l'[ADR-006](./0006-server-actions-et-injection.md)
reçoit le signaleur en option ; la configuration lui fournit le sien.

### Les appels externes sont signalés à un seul endroit

Un appel à un service externe est enveloppé dans la configuration de ce
service. Un échec y est signalé une fois : les features qui l'appellent n'ont
pas à le signaler elles-mêmes.

### Les features ne mesurent pas de durée

Les features ne mesurent pas le temps de leurs opérations : une mesure mêlée
au code d'une feature la couple à la télémétrie et brouille ce qu'elle fait.
Les mesures de durée qui accompagnaient le câblage des abilities sont
retirées. Une journalisation des opérations viendra par la composition, sans
que les features la voient. Cible à atteindre, ticket à ouvrir.

### Consequences

- Good, because un job lancé hors de Next ne peut plus planter à cause de
  Sentry : en développement, l'erreur va à la console.
- Good, because les tests n'ont plus à remplacer Sentry.
- Good, because la CI n'envoie rien à Sentry.
- Good, because changer d'outil de signalement ne touche que le dossier de
  télémétrie.

- Bad, because le fichier de variante n'existe pas dans un clone neuf tant que
  la génération n'a pas tourné. L'installation le fait ; une variable
  d'environnement mal positionnée au build livrerait la mauvaise variante.
- Bad, because le module de log de la bibliothèque de télémétrie importe
  pino d'office, alors qu'il le déclare optionnel : pino a dû rejoindre les
  dépendances du web.
- Bad, because retirer Sentry a privé le paquet de fixtures des types globaux
  de Next, qui lui arrivaient par Sentry : next a rejoint ses dépendances.
- Bad, because quelques modules hors des racines de composition importent encore
  le signaleur directement au lieu de le recevoir par injection. Cible à
  atteindre, ticket à ouvrir.
- Bad, because tant que la journalisation par la composition n'existe pas, la
  durée des opérations n'est plus mesurée.

## Pros and Cons of the Options

### Garder l'appel optionnel à Sentry partout

Il empêchait le plantage hors de Next, mais au prix d'un signalement perdu sans
bruit. Et il laissait Sentry importé partout, donc remplacé partout dans les
tests.

## More Information

### Où trouver le détail

Le mode d'emploi de la télémétrie, ses variantes et la façon de les
générer sont dans la section « Telemetry » d'[`AGENTS.md`](../../AGENTS.md).
Les règles normatives sur l'injection et les tests sans mock sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).

### Références

- [ADR-006 : Server actions et injection, à la place de tRPC](./0006-server-actions-et-injection.md)
- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./0008-strategie-de-tests.md)
- [`AGENTS.md`](../../AGENTS.md) — section « Telemetry »
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md)
  — conventions d'architecture des features

### Historique

- 2026-11-17, Marc Gavanier : rédaction de l'ADR a posteriori, d'après
  l'historique git.
- 2026-11-25, Marc Gavanier : révision, plus de mesure de durée dans les
  features.
