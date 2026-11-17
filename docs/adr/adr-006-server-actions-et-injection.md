# ADR-006 : Server actions et injection, à la place de tRPC

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                                            |
| ---------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-30 | Marc Gavanier | Première dépendance à `piqure`, pour injecter les dépendances d'un cas d'usage de l'inscription (`975721827`)                                                     |
| 2026-04-30 | Marc Gavanier | `actionBuilder`, `withInput`, `fromResult` dans `libraries/nextjs` et `Result` dans `libraries/result` ; première action, `supprimer-beneficiaires` (`b4acf93a5`) |
| 2026-07-15 | Marc Gavanier | Le type d'entrée de `withInput` va jusqu'à l'appel client ; le `catch` du builder signale l'exception et rend des codes stables (`f11108514`, `0dcc2b806`)        |
| 2026-10-05 | Marc Gavanier | Conteneur `piqure` côté client et `ClientBinder` (`d4a4ac4cc`) ; clés créées avec `keyFor`, en symboles globaux (`cc48d7ea4`)                                     |
| 2026-11-13 | Marc Gavanier | Dernier routeur tRPC (`cra`) migré en abilities ; tRPC retiré de l'application (`75361414a`, #724)                                                                |
| 2026-11-16 | Marc Gavanier | `actionBuilder` reçoit le signalement d'erreurs par `configuration/nextjs` (`9867fe801`, #731, voir ADR-011)                                                      |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                                         |

## Statut

Accepté — en place. Plus aucune procédure tRPC depuis #724.

## Contexte

Les mutations passaient par tRPC. Au 30/04/2026, l'application comptait 17 routeurs : la plupart
sous `src/server/rpc/`, trois dans des features. Chaque procédure portait sa validation, son
contrôle d'accès et son accès Prisma au même endroit. Le client les appelait par un fournisseur
dédié, adossé à `@tanstack/react-query`.

Trois défauts en découlaient :

- la logique métier vivait dans le routeur, pas dans une feature, et ne se testait qu'à travers lui ;
- une procédure pouvait renvoyer plus que nécessaire au navigateur : celle de la synchronisation
  RDV Service Public rendait l'utilisateur de session entier, jetons OAuth compris ;
- tRPC, son contexte, ses routeurs et son fournisseur doublaient un mécanisme que Next.js fournit
  déjà : les server actions.

Les composants clients, eux, importaient directement ce qu'ils appelaient. Dans Storybook, cet
import tirait le code serveur jusqu'à `server-only` : la story plantait.

## Décision

### Une server action par ability, construite avec `actionBuilder`

Toute mutation est une server action. Elle vit seule dans son fichier,
`apps/web/src/app/_actions/<feature>/<ability>.action.ts`, avec `'use server'` en tête. Aucune
server action n'est déclarée en ligne dans une page ou une route.

L'action est construite avec `actionBuilder()`, importé de `@app/web/configuration/nextjs`, qui
le compose avec le signalement d'erreurs. Elle enchaîne des middlewares :

- `withAuth()` (`features/authentification`) et `withMaintenance()` (`features/maintenance-mode`) ;
- `withInput(<Validation>)` (`libraries/nextjs`), qui valide l'entrée avec le schéma Zod de
  l'ability et propage son type d'entrée jusqu'à l'appel client ;
- `fromResult(handler, { onError })` (`libraries/nextjs`), qui traduit le `Result` rendu par
  l'ability en résultat d'action, et chaque erreur métier en message.

L'action compose ; elle ne décide rien. La règle métier est dans l'ability.

### Les contrats de l'ability dans `action/`

Une ability qui expose une mutation range ses contrats dans `abilities/<ability>/action/` :
`<ability>.validation.ts` (schéma d'entrée), `<ability>.errors.ts` (erreur métier vers message),
`<ability>.key.ts` (clé d'injection). Une ability de lecture n'a pas de dossier `action/`.

### Les erreurs en `Result`

L'ability rend un `Result<T, E>` discriminé (`libraries/result`), pas une exception métier. Une
exception qui échappe au handler est signalée par le builder, qui rend un code stable :
`INVALID_INPUT` ou `TECHNICAL_ERROR`.

### Les composants clients reçoivent l'action par injection

Un composant client n'importe pas l'action. Il appelle `inject(KEY)`. La route lie la clé à
l'action réelle avec `<ClientBinder bind={KEY} to={action}>`. Le conteneur client est
`libs/injection/client.ts`, construit avec `piqure` ; il est distinct du conteneur serveur.

Les clés se créent avec `keyFor`, jamais `key` : un symbole local ne passe pas la frontière entre
composant serveur et composant client.

### Détail normatif

`.claude/conventions/feature-architecture.md` : AB-1 (contrats dans `action/`), AB-5 (erreurs en
`Result`), AR-5 (route mince), DV-5 (injection adoptée progressivement). Le mode d'emploi court est
dans `AGENTS.md`, section « Server Actions ».

## Alternatives écartées

### Garder tRPC

Il aurait fallu maintenir deux mécanismes de mutation, et un fournisseur client qui n'apporte rien
de plus que l'appel direct d'une server action. Avec tRPC sont parties quatre dépendances que lui
seul employait : `@trpc/*`, `@tanstack/react-query`, `cookie` et `zustand`.

### Des server actions déclarées dans la page

Une closure `'use server'` dans une route fabrique un point d'entrée ad hoc, sans schéma
d'entrée. Le schéma de validation de l'action est la frontière ; il doit exister, et être le même
pour toutes les routes qui appellent l'action.

### Importer l'action dans le composant client

C'est ce qui faisait planter les stories. `sb.mock()` de Storybook ne règle pas le problème :
il résout les chemins avec Node, et l'alias `@app/web` n'existe que pour TypeScript et le bundler.

## Conséquences

Positives :

- La logique métier est dans l'ability, testée par ses scénarios sur une base réelle. L'action
  n'est qu'une composition.
- L'entrée de l'action est typée jusqu'au client. Avant le 15/07/2026, elle était `unknown` : un
  client de la fusion de doublons envoyait `targetId` au lieu de `destinationId` sans que rien ne
  casse à la compilation.
- Une exception non prévue est signalée côté serveur, au lieu d'être avalée en silence.
- Une story fournit une fausse action par `provide(KEY, …)` : aucune story n'importe
  `app/_actions`.

Négatives :

- Une mutation demande plusieurs fichiers : l'action, la validation, les erreurs, la clé, et la
  liaison dans chaque route qui monte le composant. La suppression d'une activité de médiation est
  liée par quatre routes.
- Oublier un `ClientBinder` dans une route ne se voit pas à la compilation. Seuls l'exécution et
  les tests de bout en bout le révèlent. De même, une clé créée avec `key` au lieu de `keyFor`
  passe dans les stories et casse en production (erreur 500 sur les routes liées).
- `inject` résout la clé à l'exécution : le lien entre composant et action n'est plus visible dans
  les imports.

## Références

- `apps/web/src/configuration/nextjs/index.ts`
- `apps/web/src/libraries/nextjs/action/`
- `apps/web/src/libraries/result/`
- `apps/web/src/libs/injection/client.ts`, `apps/web/src/libs/injection/client-binder.tsx`
- `apps/web/src/app/_actions/`

## ADR liés

- [ADR-004 : Architecture par features et abilities](./adr-004-architecture-par-features-et-abilities.md)
- [ADR-007 : `app/` ne contient que le routage Next](./adr-007-app-ne-contient-que-le-routage.md)
- [ADR-011 : Télémétrie isolée dans la configuration](./adr-011-telemetrie-par-la-configuration.md)
