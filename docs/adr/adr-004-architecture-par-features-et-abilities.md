# ADR-004 : Architecture par features et abilities

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                                                                      |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-30 | Marc Gavanier | Premières bibliothèques hors feature : `libraries/nextjs` (`actionBuilder`) et `libraries/result` (`b4acf93a5`, PR #488)                                                                    |
| 2026-04-30 | Marc Gavanier | Première ability, `beneficiaire/abilities/detecter-doublons`, avec ses implémentations ; un port par fichier (`b5d79dea9`, PR #488)                                                         |
| 2026-04-30 | Marc Gavanier | Les ports et erreurs propres à une ability descendent dans son `domain/` ; le domaine de la feature ne garde que l'entité, les value objects et les erreurs communes (`a51c79645`, PR #488) |
| 2026-06-25 | Marc Gavanier | `rechercher-beneficiaires` ne dépend pas de `lister-beneficiaires` : la petite duplication du filtre est acceptée pour garder les abilities découplées (`47db78608`, PR #488)               |
| 2026-06-26 | Marc Gavanier | Les conventions sont consignées dans `.claude/conventions/feature-architecture.md` (`9e7dbc659`)                                                                                            |
| 2026-06-30 | Marc Gavanier | Fusion de `refactor/beneficiaire` : `beneficiaire` est la première feature migrée (PR #488)                                                                                                 |
| 2026-08-06 | Marc Gavanier | Feature `employeuse` en abilities ; son barrel est scindé en `index.ts` (sans accès à la base) et `server.ts` (`1ea42d5e3`, `06d79eff8`, PR #575)                                           |
| 2026-08-19 | Marc Gavanier | Feature `rdvsp` migrée en abilities, routeur tRPC retiré (`b0c712832` à `1190bd93d`, PR #592)                                                                                               |
| 2026-08-24 | Marc Gavanier | Une feature n'atteint une feature refactorée que par sa frontière `index.ts` ou `server.ts` ; les features non refactorées restent importables (`7ce3be4a5`, PR #550)                       |
| 2026-10-28 | Marc Gavanier | Règle durcie : aucune feature n'importe une autre feature. Le modèle de tag sort d'`equipe` pour `tags`, la composition se fait hors des deux (PR #716)                                     |
| 2026-11-10 | Marc Gavanier | Un dossier d'ability commun à plusieurs abilities peut remonter à la racine de la feature (PR #724)                                                                                         |
| 2026-11-10 | Marc Gavanier | Dernier routeur tRPC retiré : toutes les mutations passent par des abilities appelées en server action (PR #724)                                                                            |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                                                                   |

## Statut

Accepté — appliqué à toutes les features métier sauf `legal`, qui garde son dossier `use-cases/`.
Les features techniques `adresse`, `authentification` et `pictograms` n'ont pas d'abilities.

## Contexte

Avant la refacto (état au 29/04/2026), le code métier était réparti à plusieurs adresses :

- des dossiers à la racine de `src/` (`beneficiaire/`, `equipe/`, `mediateurs/`, `structure/`,
  `rdv-service-public/`) ;
- des features découpées en `use-cases/` (393 fichiers), sans règle sur ce qu'un cas d'usage
  contient ni sur ce qu'il a le droit d'importer ;
- 17 routeurs tRPC rattachés à `server/rpc/appRouter.ts`, les uns dans `server/rpc/`, les
  autres dans les features. Certaines procédures mêlaient plusieurs cas d'usage : `tags.save`
  faisait à la fois la création et la modification ;
- 251 fichiers dans `app/` hors pages, layouts et routes (voir ADR-007).

Un même concept vivait souvent à deux endroits. L'accueil, par exemple, était à la fois dans
`app/coop/(accueil-coop)` et dans `features/dashboard`. Rien n'empêchait une feature d'aller
lire l'implémentation d'une autre. Modifier un cas d'usage demandait de retrouver ses morceaux
dans plusieurs dossiers, et en supprimer un sans casser les autres était risqué.

## Décision

### Une feature, des abilities

Le code métier vit dans `apps/web/src/features/<feature>/`. Une feature couvre un périmètre
fonctionnel complet, y compris son administration et ses statistiques : il n'y a pas de
feature `administration` ni `statistique` centrale.

Une ability est un cas d'usage, et un cas d'usage est un dossier :
`features/<feature>/abilities/<ability>/`. Elle contient au besoin :

- `domain/` : ses ports (signatures) et sa logique pure ;
- `implementation/` : les adaptateurs, dont `implementation/prisma/` (requêtes et mutations) ;
- `action/` : le schéma d'entrée et les erreurs de sa server action, s'il y en a une (AB-1) ;
- `ui/` : ses composants, ses pages et ses presenters ;
- `<ability>.ability.md` et `<ability>.steps.ts` : ses scénarios BDD.

À la racine de la feature : `domain/` (entité et value objects communs, voir ADR-005), `db/`
(transfer entre Prisma et le domaine), `index.ts` et, si la feature expose de quoi lire la base,
`server.ts`.

### Pas de dépendance entre abilities ni entre features

- Une ability n'importe pas le code d'une autre ability (IS-1).
- Une feature n'importe pas le code d'une autre feature (IS-2, AR-2). Quand elle a besoin d'une
  autre feature, elle déclare un port dans son domaine (AR-3). L'implémentation est fournie
  depuis `app/` : injection, composant passé en prop, ou paramètre (voir ADR-007).
- Le code à la racine d'une feature n'importe jamais une de ses abilities. Le sens autorisé est
  ability → racine.
- En dernier recours, on duplique plutôt que de coupler.

Exception : une feature encore non refactorée n'a pas de frontière définie. On peut l'importer
plutôt que de tout refactorer d'un coup.

### Le code commun remonte, il ne se partage pas latéralement

- Un dossier d'ability (`action/`, `ui/`, `implementation/`…) commun à plusieurs abilities peut
  remonter à la racine de la feature sous le même nom (AB-2). Exemple :
  `features/activites/ui/saisie`, partagé par les saisies individuelle et collective.
- Un modèle d'entrée partagé va dans `features/<feature>/domain/` (AB-2).
- Un code sans notion métier, utile à plusieurs features, va dans `libraries/` (AR-4) :
  `model`, `result`, `nextjs`, `insee`, `pluriel`…

### Migration verticale

On migre une ability à la fois, pas une couche à la fois (PR-7). Chaque ability migrée est
déployable. L'ancien code est supprimé quand plus rien ne l'utilise.

Le détail normatif (arborescence, règles AR, AB, IS) est dans
[`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md),
sections 1, 4 et 5.

## Alternatives écartées

### Garder les `use-cases/` et les routeurs tRPC

Le découpage existait, mais sans règle d'isolation. Les routeurs regroupaient des cas d'usage
par table plutôt que par intention. tRPC a été remplacé par des server actions, natives dans
Next.

### Migrer couche par couche

Refaire tout le domaine, puis toutes les implémentations, puis toutes les pages aurait laissé
l'application dans un état intermédiaire non livrable pendant des mois.

### Partager du code entre abilities par import direct

C'était la pente naturelle (une recherche qui réutilise le filtre de la liste). Elle soude les
abilities : on ne peut plus en modifier ou en supprimer une seule. La duplication d'une
vingtaine de lignes a été jugée moins coûteuse (`47db78608`).

### Laisser une feature importer une autre par sa frontière publique

C'était la règle du 24/08/2026. Elle a été durcie le 28/10/2026 : même par `index.ts` ou
`server.ts`, l'import crée une dépendance entre périmètres qui devraient pouvoir évoluer seuls.

## Conséquences

Positives :

- Un cas d'usage se lit, se teste et se supprime dans un seul dossier.
- 155 abilities dans 16 features au 17/11/2026, dont 154 ont leurs scénarios `.ability.md`.
- tRPC a disparu de l'application.
- Les dossiers métier à la racine de `src/` (`beneficiaire/`, `equipe/`, `mediateurs/`,
  `structure/`, `rdv-service-public/`) n'existent plus.

Négatives :

- Plus de fichiers et plus de dossiers pour un même comportement.
- De la duplication volontaire entre abilities, qu'il faut assumer en revue.
- La composition entre features se fait dans les routes, qui répètent parfois le même câblage
  (voir ADR-007).
- Le dossier `src/composition/` (`statistiques`, `utilisateurs`) assemble encore des features
  hors de `app/`. Ce n'est pas le modèle cible et il reste à revoir.
- L'exception des features non refactorées rend la règle moins simple à vérifier tant que la
  migration n'est pas finie.

## Références

- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — AR-2 à AR-4, AB-1, AB-2, IS-1, IS-2, PR-7
- ADR-005 : domaine modélisé par des value objects brandés
- ADR-007 : `app/` ne contient que le routage Next

## ADR liés

- [ADR-005 : Domaine modélisé par des value objects brandés](./adr-005-domaine-en-value-objects-brandes.md)
- [ADR-006 : Server actions et injection, à la place de tRPC](./adr-006-server-actions-et-injection.md)
- [ADR-007 : `app/` ne contient que le routage Next](./adr-007-app-ne-contient-que-le-routage.md)
- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./adr-008-strategie-de-tests.md)
