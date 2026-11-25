---
status: "accepted"
date: 2026-11-25
decision-makers:
  - Marc Gavanier
---

# Un scénario BDD par ability, Vitest sans isolation ni mock

## Context and Problem Statement

Le découpage en features et en abilities, posé par
l'[ADR-004](./0004-architecture-par-features-et-abilities.md), fait de chaque
cas d'usage une ability. Il fallait une règle de test qui dise, pour chaque
ability, quoi tester et à quel niveau.

Avant la refonte, les tests remplaçaient des modules entiers et vérifiaient
qu'une fonction avait été appelée avec tels arguments. Ces tests suivaient
l'implémentation : un refactoring sans changement de comportement les cassait,
et un vrai défaut pouvait passer si l'appel restait le même.

Les modules qui importaient directement leurs services extérieurs ne pouvaient
être testés qu'en les remplaçant.

Enfin, la suite unitaire était lente : sur un runner à 4 cœurs, Jest avec la
couverture V8 la faisait en 274 s.

## Considered Options

- Un scénario BDD par ability, Vitest sans isolation ni mock (option retenue)
- Un test unitaire et un scénario pour chaque ability
- Des scénarios BDD sur une base en mémoire
- Garder les mocks et accélérer Jest

## Decision Outcome

Option retenue : « Un scénario BDD par ability, Vitest sans isolation ni mock
».

Chaque ability est testée par un scénario BDD joué contre une vraie base, et
les tests unitaires sont réservés à la logique pure. Aucun test ne remplace
de module ni n'espionne d'appel : les services extérieurs sont injectés, ce
qui permet de faire tourner Vitest sans isolation.

### Un scénario BDD par ability

Chaque ability a sa spécification en Gherkin, ses étapes, et partage avec les
autres abilities de sa feature des hooks communs. Ces scénarios jouent contre
une vraie base PostgreSQL : ils sont à la fois le test d'acceptation et le test
d'intégration de l'ability.

Une ability de pure consultation n'a pas de spécification : elle affiche ce
qu'on lui passe et ne décide rien, si bien qu'un scénario ne ferait que
recopier la page. Dès qu'elle filtre, restreint par des droits, agrège,
calcule ou choisit ce qu'elle affiche, elle est spécifiée. Une feature sans
ability qui porte une règle de domaine la spécifie à sa racine.

### Des tests unitaires seulement pour la logique pure

Un test unitaire n'existe que là où il y a une logique pure à isoler : un
value object, une règle métier, un presenter. Une requête ou une projection
sans logique n'a que son scénario.

Les tests d'intégration restent pour ce qui traverse plusieurs abilities ou
l'infrastructure.

### Un test unitaire a les droits de son unité

Un test unitaire, une story ou un test de composant isole son unité : il
n'importe que cette unité, son outil de test, et ce que l'unité a elle-même
le droit d'importer. Il n'utilise aucune fixture : il écrit ses valeurs avec
les constructeurs du domaine, quitte à les répéter d'un test à l'autre. Une
valeur partagée par fixture couplerait des tests qui n'ont rien à voir, et
ferait dépendre une unité de ce qu'elle ne connaît pas.

### Les tests de composition sont des racines limitées à leur feature

Un test d'intégration, une étape de scénario, un hook de scénario et les
fixtures qu'ils utilisent composent, comme un point d'entrée. Ils importent
toute ability de leur feature, ses fixtures et la configuration, mais jamais
une autre feature.

### Ni mock ni espion, des doublures écrites à la main

Les tests vérifient des valeurs retournées, jamais des appels. Un module
reçoit ses services extérieurs en paramètre au lieu de les importer. Une
racine de composition assemble ceux de production ; les tests passent des
doublures écrites à la main.

Une doublure répond selon ce qu'on lui demande. Une portée trop large ou une
date fausse se voit donc dans le résultat, sans espionner l'appel.

### Vitest sans isolation

Vitest remplace Jest partout, sans isolation : les modules ne sont pas
rechargés pour chaque fichier de test. C'est possible parce qu'aucun test ne
remplace de module ni ne modifie d'état global ; cinq passes en ordre
aléatoire l'ont vérifié. Sur le même runner à 4 cœurs, la suite unitaire
passe de 274 s à 25 s, couverture comprise.

Les tests se répartissent en deux projets, unitaire et intégration.
L'intégration tourne en série, puisque ses fichiers partagent la base.

### Intégration et Cucumber sur une base jetable

L'intégration et Cucumber écrivent dans la base et la vident. Ils tournent sur
une base jetable : neuve à chaque exécution en CI, créée puis supprimée en
local.

### Consequences

- Good, because la suite est rapide, et l'ordre des tests n'a pas d'importance.
- Good, because un refactoring qui garde le comportement ne casse plus de test.
- Good, because l'injection explicite a rendu pures des fonctions qui
  dépendaient de services extérieurs.

- Bad, because une doublure écrite à la main est du code à maintenir, et elle
  peut s'écarter du service réel.
- Bad, because ce qui ne se vérifie qu'en espionnant n'est plus testé. Le test
  du client RDV Service Public a été supprimé : seul un test contre ce
  service vaudrait, et il n'offre pas d'environnement de test.
- Bad, because les étapes Cucumber sont globales : deux phrasés identiques
  dans deux fichiers entrent en collision.
- Bad, because l'intégration et Cucumber vident la base. Lancés par erreur sur
  une base restaurée depuis la production, ils l'effacent.
- Bad, because un test qui sème une valeur calculée par la base doit semer les
  vraies lignes qui la produisent.
- Bad, because sans fixture, des tests unitaires répètent les mêmes valeurs.

## Pros and Cons of the Options

### Un test unitaire et un scénario pour chaque ability

Une ability sans logique pure n'aurait qu'un test unitaire qui recopie un objet
littéral. Il ne protège rien et double le coût d'un changement.

### Des scénarios BDD sur une base en mémoire

Une base en mémoire ne vérifie ni le SQL brut, ni les contraintes, ni les
triggers. Le scénario n'aurait plus rien d'un test d'intégration.

### Garder les mocks et accélérer Jest

Ajouter des workers ne règle pas le coût de la couverture. Et garder les mocks
impose l'isolation, qui est justement ce qui coûte.

## More Information

### Où trouver le détail

Les abilities de chaque feature, dans le
[dossier des features](../../src/features/), décrivent chaque comportement dans
leur spécification en Gherkin ; ce sont des specs exécutables, qui font foi,
et les étapes Cucumber placées à côté de chacune les jouent. Les règles
normatives sur les tests sont dans la section 7 des
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).

### Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [ADR-005 : Domaine modélisé par des value objects brandés](./0005-domaine-en-value-objects-brandes.md)
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md)
  — section 7, tests
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md#tests) — section Tests

### Historique

- 2026-11-17, Marc Gavanier : rédaction de l'ADR a posteriori, d'après
  l'historique git.
- 2026-11-24, Marc Gavanier : révision, exemption des abilities de pure
  consultation et spécification d'une feature sans ability.
- 2026-11-25, Marc Gavanier : révision, droits d'un test unitaire réduits à
  ceux de son unité, sans fixture, et tests de composition limités à leur
  feature.
