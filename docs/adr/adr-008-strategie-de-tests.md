# ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                                        |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-16 | Marc Gavanier | Harnais Cucumber : scénarios Gherkin en markdown (`*.ability.md`), steps joués contre la vraie base, premiers scénarios de `creer-beneficiaire` (`bac134abe`) |
| 2026-06-30 | Marc Gavanier | Le harnais arrive sur `main` (#548)                                                                                                                           |
| 2026-10-05 | Marc Gavanier | Cucumber tourne en CI pour la première fois, d'abord non bloquant, avec la migration vers GitHub Actions (`39edf02cb`, #645)                                  |
| 2026-11-16 | Marc Gavanier | Passage de Jest à Vitest, sans isolation ; plus aucun mock ni espion dans le dépôt ; Jest retiré (`9867fe801`, #731)                                          |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                                     |

## Statut

Accepté — appliqué à tout le dépôt.

## Contexte

La refonte découpe chaque feature en abilities : un cas d'usage, un dossier. Il fallait une règle
de test qui dise, pour chaque ability, quoi tester et à quel niveau.

Avant la refonte, les tests remplaçaient des modules entiers. `jest.mock` et les espions
vérifiaient qu'une fonction avait été appelée avec tels arguments. Ces tests suivaient
l'implémentation : un refactoring sans changement de comportement les cassait, et un vrai défaut
pouvait passer si l'appel restait le même.

Les modules qui importaient directement leurs services (Base Adresse Nationale, API Recherche
d'entreprises, Sentry, client HTTP) ne pouvaient être testés qu'en les remplaçant.

Enfin, la suite unitaire était lente. Sur un runner à 4 cœurs, Jest avec la couverture V8 la
faisait en 274 s.

## Décision

### Un scénario BDD par ability

Chaque ability a son `<ability>.ability.md`, en Gherkin écrit en markdown, et ses steps Cucumber
(`<ability>.steps.ts`). Les hooks partagés d'une feature vivent dans `<feature>.cucumber.ts`.

Ces scénarios jouent contre une vraie base PostgreSQL, pas contre une base en mémoire. Ils sont à
la fois le test d'acceptation et le test d'intégration de l'ability. La règle est TS-1 de
`.claude/conventions/feature-architecture.md`.

### Des tests unitaires seulement pour la logique pure

Un `.spec.ts` n'existe que là où il y a une logique pure à isoler : un value object, une règle
métier, un presenter. Une requête ou une projection sans logique n'a que son scénario (TS-2).

Les `*.integration.ts` restent pour les cas qui traversent plusieurs abilities ou l'infrastructure
(19 fichiers à la date de cet ADR).

### Ni mock ni espion

Les tests vérifient des valeurs retournées, jamais des appels. Un module ne doit plus importer un
service extérieur : il le reçoit en paramètre. Une racine de composition (le binding) assemble les
services de production ; les tests, les scénarios et les autres appelants passent les leurs, écrits
à la main.

Une doublure répond selon ce qu'on lui demande. Une portée trop large, une date fausse ou une
source consultée à tort se voient donc dans le résultat, sans espionner l'appel.

### Vitest, sans isolation

Vitest remplace Jest dans tout le dépôt. Les modules ne sont pas rechargés pour chaque fichier
(`isolate: false`). C'est possible parce qu'aucun test ne remplace de module ni ne modifie d'état
global : les tests sont indépendants. Cinq passes en ordre aléatoire l'ont vérifié.

Sur le même runner à 4 cœurs, la suite unitaire passe de 274 s à 25 s, couverture comprise.

`apps/web/vitest.config.ts` porte deux projets : `unit` et `integration`. L'intégration s'exécute
en série (`fileParallelism: false`), puisque ses fichiers partagent la base.

### Intégration et Cucumber sur une base jetable

L'intégration et Cucumber écrivent dans la base et la vident. Ils tournent sur une base jetable,
jamais sur une base qui porte des données utiles. La CI leur donne une base neuve à chaque
exécution, sur l'image PostgreSQL de CI (`coop-postgres-ci`). En local, on crée une base jetable
dans le conteneur, on y applique migrations et fixtures, puis on la supprime.

## Alternatives écartées

### Un test unitaire et un scénario pour chaque ability

Une ability sans logique pure n'aurait qu'un spec qui recopie un objet littéral. Il ne protège
rien et double le coût d'un changement.

### Des scénarios BDD sur une base en mémoire

Une base en mémoire ne vérifie ni le SQL brut, ni les contraintes, ni les triggers
([ADR-013](./adr-013-compteurs-tenus-par-la-base.md)). Le scénario n'aurait plus rien d'un test
d'intégration.

### Garder les mocks et accélérer Jest

Plus de workers ou du sharding ne règlent pas le coût de la couverture V8 de Jest sur un petit
runner. Et garder les mocks impose l'isolation, qui est justement ce qui coûte.

## Conséquences

- Positif : la suite unitaire tient en 25 s, et l'ordre des tests n'a pas d'importance.
- Positif : un refactoring qui garde le comportement ne casse plus de test.
- Positif : l'injection explicite a sorti Sentry d'une trentaine de modules et rendu pures des
  fonctions comme le passage d'un résultat BAN à une adresse.
- Négatif : une doublure écrite à la main est du code à maintenir, et elle peut s'écarter du
  service réel.
- Négatif : ce qu'on ne peut vérifier qu'en espionnant n'est plus testé. Le test du client RDV
  Service Public a été supprimé : seul un test contre RDV Service Public vaudrait, et ce service
  n'offre pas d'environnement pour cela.
- Négatif : les steps Cucumber sont globaux. Deux phrasés identiques dans deux fichiers entrent en
  collision (TS-5).
- Négatif : l'intégration et Cucumber ne se lancent pas sur la base de travail. Lancés par erreur
  sur une base restaurée depuis la production, ils la vident.
- Négatif : un test qui sème une valeur calculée par la base, comme un compteur, doit semer les
  vraies lignes qui la produisent.

## Références

- `.claude/conventions/feature-architecture.md`, section 7
- `apps/web/cucumber.json`, `apps/web/vitest.config.ts`, `vitest.config.ts`
- `.github/workflows/ci.yml`, jobs « Integration tests » et « Cucumber »
- `CONTRIBUTING.md`, section Tests

## ADR liés

- [ADR-004 : Architecture par features et abilities](./adr-004-architecture-par-features-et-abilities.md)
- [ADR-005 : Domaine modélisé par des value objects brandés](./adr-005-domaine-en-value-objects-brandes.md)
- [ADR-013 : Compteurs dénormalisés tenus par des triggers](./adr-013-compteurs-tenus-par-la-base.md)
