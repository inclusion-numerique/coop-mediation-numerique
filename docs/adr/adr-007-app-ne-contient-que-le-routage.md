# ADR-007 : `app/` ne contient que le routage Next

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                                                          |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-30 | Marc Gavanier | Premières server actions dans des fichiers dédiés : `app/_actions/beneficiaire/*.action.ts` (`b4acf93a5`, `e918f5d67`, PR #488)                                                 |
| 2026-06-25 | Marc Gavanier | Règle posée : pas de composant dans `app/`. Le formulaire du bénéficiaire rejoint la feature et reçoit son action en prop (`c1317e810`, PR #488)                                |
| 2026-06-26 | Marc Gavanier | Les routes de création et de modification délèguent à une page de la feature ; la closure `'use server'` écrite dans la route est supprimée (`60e95adbe`, PR #488)              |
| 2026-06-26 | Marc Gavanier | La route de modification suit les quatre étapes : contrôle d'accès, préparation des entrées, récupération par une ability, rendu (`dd22c9cba`, PR #488)                         |
| 2026-08-18 | Marc Gavanier | Critère énoncé : ce qui n'a pas de spécificité Next sort de `app/`, chargeur de données compris. L'écran d'accueil quitte `app/` pour `features/accueil` (`60cdfb2c1`, PR #592) |
| 2026-11-12 | Marc Gavanier | Composition entre features : plus de fichier d'assemblage dans `app/`. Chaque feature fournisseuse expose une fonction, la route la passe à la consommatrice (PR #724)          |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                                                       |

## Statut

Accepté — migration en cours. Au 17/11/2026, 69 fichiers suivis dans `apps/web/src/app` ne
sont ni une page, ni un layout, ni une route, ni une page d'erreur, ni une server action de
`_actions/`. Il y en avait 251 au 29/04/2026. Ce reste mélange des composants à déplacer
(pages publiques, onboarding, pieds de page), des outils de test de l'API v1 et des fichiers à
examiner avec le critère ci-dessous. Deux route handlers de déconnexion appellent encore
`prismaClient` directement.

## Contexte

Avant la refacto, `app/` portait bien plus que le routage. Une route pouvait contenir à la fois
le contrôle d'accès, une requête Prisma, une quarantaine de lignes de mise en forme des
données et tout le JSX de la page. Des composants, des chargeurs de données et des fichiers
d'assemblage vivaient à côté des `page.tsx`.

Deux problèmes en découlaient :

- Le code métier dépendait du framework par sa seule adresse. Tout fichier de `app/` est soumis
  aux conventions de Next. Un changement de version de Next ou de routeur touche alors du code
  qui n'a rien à voir avec le routage.
- Le même écran vivait à deux endroits. L'accueil était à la fois dans
  `app/coop/(accueil-coop)` (la page, six composants, le chargeur) et dans `features/dashboard`.
  Une feature allait même chercher un composant dans `app/` (`mon-reseau` importait
  `CommunicationConum`).

Une route qui définit sa server action en ligne (`'use server'` dans une closure) fabrique
aussi un point d'entrée sans schéma de validation propre.

## Décision

### Le critère : ce fichier est-il couplé au framework ?

Un fichier reste dans `app/` seulement s'il a une spécificité Next. La question n'est pas
« est-ce un composant ? ». Ce qui reste :

- `page.tsx` et `layout.tsx` : routage, `metadata`, contrôle d'accès, chargement, rendu ;
- `route.ts` : route handler, mince, qui délègue à la feature ;
- `_actions/<feature>/<nom>.action.ts` : les server actions ;
- les fichiers spéciaux de Next (`error.tsx`, `not-found.tsx`…).

Tout le reste part dans une feature : composants, presenters, chargeurs de données. Prisma et
l'agrégation de données ne sont pas du framework. Les imports de `next/link` et `next/image` ne
suffisent pas à justifier qu'un fichier reste dans `app/`.

Un composant qui ne trouve pas sa feature est un signal de conception : une feature manque, ou
un nom désigne une route plutôt qu'une capacité. S'il sert plusieurs features, il va dans
`src/components` ou `libraries/`.

### Une page fait quatre choses, dans cet ordre

1. **Contrôle d'accès** : authentification et droit sur la ressource.
2. **Préparation des entrées** : les paramètres de route et de requête sont lus par un schéma
   ou un value object (`BeneficiaireId(beneficiaireId)`).
3. **Récupération** : par une ability, jamais par `prismaClient`. Si rien n'est trouvé,
   `notFound()`.
4. **Rendu** : un seul composant page de la feature, avec ses données déjà mises en forme par
   un presenter.

Exemple : `app/coop/(full-width-layout)/mes-beneficiaires/[beneficiaireId]/modifier/page.tsx`.

### Server actions : jamais en ligne

`'use server'` ne s'écrit que dans un fichier dédié sous `app/_actions/`. L'action est passée
en prop au composant de la feature. Les paramètres (l'identifiant à modifier, par exemple)
transitent par les valeurs du formulaire, pas par une closure dans la route. Si l'entrée ne
peut pas être garantie côté client, c'est le schéma de l'action qui l'exige à l'exécution.

### Composition entre features

Une page assemble parfois plusieurs features : une saisie d'activité a besoin des tags, des
lieux, de l'employeuse et des rendez-vous. La règle :

- la feature consommatrice déclare ce qu'elle attend, sous forme de port ou de paramètre ;
- la feature fournisseuse expose une fonction à paramètres simples, compatible avec ce port ;
- la route ou l'action se contente de passer cette fonction. Elle peut répéter ce câblage dans
  deux routes ;
- aucun fichier d'assemblage dans `app/`. Une fonction qui compose plusieurs fournisseurs vit
  dans la feature consommatrice et reçoit ses fournisseurs en paramètres.

Formes d'injection acceptées : `piqure`, composant passé en prop, paramètre (URL, argument).

Le détail normatif est dans
[`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md),
règles AR-5, UI-1 et UI-4.

## Alternatives écartées

### Un critère « pas de composant dans `app/` »

C'était la première formulation (25/06/2026). Elle laissait dans `app/` des fichiers qui ne sont
pas des composants mais n'ont rien de Next, comme les chargeurs de données. Le critère du
couplage au framework, énoncé le 18/08/2026, la remplace.

### Des fichiers de composition dans `app/` ou dans `src/composition/`

`ports-de-la-saisie.ts` composait quatre features dans `app/`. `src/composition/` en fait
autant hors de toute feature. Ces fichiers contiennent de la logique qui n'a rien de Next, et
deviennent des carrefours que personne ne possède. Ils ont été dissous pour la saisie
d'activité. `src/composition/statistiques` et `src/composition/utilisateurs` restent à revoir.

### Un constructeur de pages générique (middlewares enchaînés)

Il imposerait les quatre étapes par le code. Il n'est pas adopté pour les pages : les routes
écrivent les quatre étapes directement, ce qui reste lisible pour une route d'une quarantaine
de lignes. L'API v1 a son propre `routeBuilder` (PR #703).

## Conséquences

Positives :

- Une route se lit en quatre étapes, sans logique cachée.
- Le code métier ne dépend plus de Next par son emplacement. Il en garde des usages ponctuels
  (`next/link`, `next/image`, `next/navigation`).
- Un composant de page reçoit toutes ses données en props : il se rend seul, dans un test ou
  dans Storybook.
- Une server action a toujours son fichier. Celles qui reçoivent une entrée la valident par un
  schéma (`withInput`).

Négatives :

- Le câblage entre features se répète d'une route à l'autre.
- Les routes importent parfois profondément dans une ability (`…/abilities/<ability>/ui/pages/…`)
  plutôt que par un barrel.
- La migration n'est pas finie : 69 fichiers restent à trier, et deux route handlers lisent
  encore la base directement.
- `src/composition/` existe encore et contredit la règle.

## Références

- `apps/web/src/app/_actions/`
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — AR-5, UI-1, UI-4
- ADR-004 : architecture par features et abilities

## ADR liés

- [ADR-004 : Architecture par features et abilities](./adr-004-architecture-par-features-et-abilities.md)
- [ADR-006 : Server actions et injection, à la place de tRPC](./adr-006-server-actions-et-injection.md)
