# Feature Architecture — conventions du dépôt (La Coop de la médiation numérique)

> **Source de vérité normative** pour écrire une feature au standard du dépôt. Ce fichier est le
> **« quoi »**, citable règle par règle ; le **« pourquoi »** de chaque choix est consigné dans les
> ADR de `docs/decisions/` (table ci-dessous).

| Sections                     | ADR                                                                                                        |
|------------------------------|------------------------------------------------------------------------------------------------------------|
| §1 Architecture, §5 Isolation | ADR-004 (features et abilities), ADR-007 (`app/` ne contient que le routage), ADR-016 (structure du dépôt) |
| §2 Domain modeling           | ADR-005 (value objects brandés)                                                                            |
| §4 Structure d'une ability   | ADR-004, ADR-006 (server actions et injection)                                                             |
| §6 UI                        | ADR-007, ADR-009 (TanStack Form), ADR-010 (styles DSFR)                                                    |
| §7 Tests                     | ADR-008 (un scénario BDD par ability, Vitest sans mock)                                                    |
| §9 Choix assumés             | ADR-005, ADR-006, ADR-008, ADR-009                                                                         |

## 0. Mode d'emploi (agents & skills)

- **Chaque règle a un ID stable** (`DM-3`, `AB-1`…). Cite-les ; ne paraphrase pas.
- **Sévérités** : `BLOCKER` (corriger avant commit) · `WARN` (corriger ou justifier explicitement) · `INFO` (préférence).
- **`convention-reviewer`** : note un diff et sort une ligne par violation :
  `‹ID› ‹SÉVÉRITÉ› ‹cible› — constat — correctif`, où `cible` = `path:line` (violation sur une ligne) **ou** `path/`/`dir/` (violation d'absence ou d'emplacement — fichier manquant, mauvais dossier). Jamais de `:line` inventé. Ne signale **jamais** ce qui est en §9 (choix assumés). Sur un commit/range **historique**, juge l'état tel qu'introduit et le note dans `Périmètre relu`.
- **`domain-modeler`** : §2 est la checklist de conception à satisfaire **avant** d'écrire du code (rend un modèle à valider, pas du code).
- **`feature-auditor`** : parcourt §1–§7 dimension par dimension et produit la liste des résidus.
- **skills `/build-ability`, `/build-feature`, `/build-form`** : §4 = structure à produire ; §8 = process ; §2/§3 = qualité.
- **Détection** : chaque règle porte un signal grep-able quand c'est possible (`rg` patterns). Un signal qui matche = candidat violation à confirmer en lecture, pas une certitude.

---

## 1. Architecture cible (AR) — arborescence & dépendances

Arbre canonique d'une feature :

```
features/<feature>/
├── domain/                      # PUR : 0 import infra, 0 import d'une autre feature
│   ├── <sujet>/                 # sous-dossier par sujet dès 3 fichiers (identifiants/, invitation/…)
│   ├── <value-object>.ts        # defineModel + .brand() + smart constructor
│   ├── <entity>.ts (+ .spec.ts) # entité (champs readonly, discriminated unions)
│   ├── errors.ts · ports.ts     # erreurs métier typées · ports déclarés par la feature
│   └── index.ts                 # seul barrel admis avec implementations/<technique>/index.ts
├── abilities/<ability>/         # 1 cas d'usage = 1 dossier (voir §4)
├── action/ · ui/ · implementations/ # dossiers d'ability remontés à la racine quand leur code sert à plusieurs abilities
├── middlewares/                 # middlewares des server actions et des routes (with-*.ts)
├── implementations/<technique>/ # un dossier par choix technique (prisma/, email/, session/, api/…), jamais de fichier à la racine
├── fixtures/                    # données de démonstration et de test de la feature
└── <sujet>.cucumber.ts          # hooks et steps Cucumber partagés par les abilities, seulement à la racine
```

Une feature sans ability qui porte une règle de domaine a aussi, à sa racine, `<feature>.feature.md` et `<feature>.steps.ts` (TS-1).

Rien d'autre à la racine d'une feature : ni `index.ts`, ni `server.ts`, ni fichier posé à plat.

### Structure et nommage (ST)

| ID   | Règle | Sévérité |
|------|-------|----------|
| ST-1 | Noms de fichiers et de dossiers en **kebab-case**, sauf un `.tsx` dont l'export principal est un composant (**PascalCase**). **Français pour le métier**, **anglais pour la technique** (`prisma/`, `session/`, `.query`, `.transfer`). | BLOCKER |
| ST-2 | **Barrels** admis seulement dans `domain/index.ts` et `implementations/<technique>/index.ts`, d'une feature ou d'une ability : ce sont les seuls emplacements où tout ce qui est derrière l'index partage les mêmes dépendances. Ailleurs (racine de feature ou d'ability, `ui/`, `fixtures/`, `middlewares/`), on importe le fichier qui définit le symbole. Un barrel admis n'est pas obligatoire. | BLOCKER |
| ST-3 | **Sous-dossier par sujet dès 3 fichiers**, jamais en dessous ; **2 niveaux au plus** sous un dossier de rôle ; au-delà d'une quinzaine de fichiers à plat, regrouper par sujet. | WARN |
| ST-4 | `implementations/` : **un dossier par technique**, quel que soit son nombre de fichiers. À sa racine, seuls des `*.binding.ts`, qui assemblent plusieurs techniques. | BLOCKER |
| ST-5 | **Catégorie** (`nom.<catégorie>.ts`) là où elle dit le rôle : `action/` → `.validation`, `.errors`, `.key`, `.transfer` (saisie → domaine) ; `implementations/<technique>/` → la catégorie dit le rôle, quelle que soit la technique : `.query` (lit : base, API, session, fichier), `.mutation` (écrit ou produit un effet, envoi d'e-mail compris), `.transfer` (traduit entre un format extérieur et le domaine), `.client` (client ou configuration d'un service extérieur), `.sql`, `.where`, `.select`, `.order-by` (fragments de requête), `.payload` (forme des données d'un service extérieur), `.params` (entrée extérieure validée), `.response` (réponse de notre API), `.middleware`, `.classeur` (fichier exporté ou importé), `.adapter` (utilitaire technique), `.email.tsx` (gabarit d'e-mail) ; aucun fichier sans catégorie, hors `index.ts` ; `ui/` → `.presenter` (dans `presenters/`), `.labels` (dans `labels/`), `.search-params` (dans `search-params/`), `.columns` (dans `columns/`), `.validation`, `.form-options`, `.form-data` (dans `forms/`), `.slot.tsx` (dans `slots/`) ; tests → `.spec`, `.integration`, `.stories`, `.cy`. Value objects, entités et fixtures n'en ont pas. | WARN |
| ST-6 | Une **clé d'injection** (`.key.ts`) ne porte qu'une server action et ne vit que dans `action/` : celui de l'ability qui fournit l'action, ou celui du consommateur qui en a besoin hors de cette ability (la racine de la feature, ou une autre feature), qui la déclare avec un type d'entrée structurel sans importer l'ability. | BLOCKER |
| ST-7 | Tests de bout en bout : les **parcours** sur plusieurs pages dans `e2e/*.e2e.ts` ; un test qui ne vérifie qu'une page ou une route est un `page.test.ts` ou `route.test.ts` posé à côté d'elle dans `app`. | BLOCKER |

| ID   | Règle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Sévérité | Détection                                                                                                                  |
|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------|
| AR-1 | `domain/` n'importe **aucune** infra (`@prisma/client` runtime, `next/*`, `react`, fetch). Import **de type** Prisma toléré uniquement si justifié (ex. row shape d'un mapper).                                                                                                                                                                                                                                                                                                                                                                                                            | BLOCKER  | `rg "from '@prisma/client'" features/*/domain` (hors `import type`) ; `rg "from 'next/ \| from 'react'" features/*/domain` |
| AR-2 | Une feature n'importe **jamais** le code d'une autre feature : ni son `domain/`, ni son `index.ts`, ni son `server.ts`. Quand elle a besoin d'une autre feature, elle déclare un port dans son domaine (AR-3). Exception : une feature non refactorée, sans frontière définie, reste importable.                                                                                                                                                                                                                                                                                           | BLOCKER  | `rg --pcre2 "features/(?!<self>)[a-z-]+" features/<self>`                                                                  |
| AR-3 | Besoin d'une autre feature = **branded type local** + **port** dans son domaine. L'implémentation est fournie depuis `app/`, où les routes composent les features : **injection**, composant passé en prop, ou paramètre.                                                                                                                                                                                                                                                                                                                                                                  | WARN     | revue manuelle                                                                                                             |
| AR-4 | Le code partagé entre 2 features vit dans `libraries/` (ou `shared/`), pas dans une feature.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | WARN     | —                                                                                                                          |
| AR-5 | Routes `app/**` = hubs minces : (1) auth, (2) input via value object/schema, (3) données via une **ability** (jamais `prismaClient` brut), (4) rend **une** page ou **un** layout de feature, composé de slots s'il assemble plusieurs abilities ou features (UI-1). | BLOCKER  | `rg "prismaClient\." src/app` |
| AR-6 | Calibrer l'effort DDD au sous-domaine : Core (`activite`, `beneficiaire`) = riche ; Supporting = modéré ; Generic/externe = ACL minimal. Ne pas over-engineer une feature simple.                                                                                                                                                                                                                                                                                                                                                                                                          | INFO     | —                                                                                                                          |
| AR-7 | Une feature peut exposer un **fragment SQL** dans son API publique quand un consommateur doit filtrer, trier ou compter dessus dans une requête paginée — recoller en mémoire y fausserait pagination et totaux. Conditions : le fragment ET ses colonnes vivent dans `implementations/prisma/<entity>.sql.ts` (les appelants n'écrivent jamais l'alias ni un nom de colonne en dur) ; les identifiants injectés sont documentés comme non-paramétrables et sous la responsabilité de l'appelant ; **chaque** requête qui l'embarque — requêtes de comptage comprises — est exercée par un test d'intégration. | WARN     | `rg "Prisma.raw" features/*/implementations/prisma` ; alias SQL (`s1.`) écrit en dur chez un consommateur                                      |

---

## 2. Domain modeling — checklist de conception (DM)

> **À satisfaire AVANT de coder le domaine** (sur `beneficiaire`, le premier domaine modélisé, 7 itérations de relecture auraient été évitées en appliquant ceci dès le départ). `domain-modeler` répond à chaque point et fait valider le modèle.

| ID      | Règle                                                                                                                                                                                                                                                                                                                                                                               | Sévérité | Détection                                                                                  |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------------------------------------------------|
| DM-1    | **Tout primitif métier** = `defineModel(...)` + `.brand('Name')`. Y compris les **enums** (`defineModel(z.enum(...).brand('Name'))`). Aucun littéral string nu.                                                                                                                                                                                                                     | BLOCKER  | `rg ": string( \|$\|\))" features/*/domain` ; champs `string`/`number` nus dans une entité |
| DM-1bis | **Seuil de branding** (résout la tension DM-1 ↔ AR-6) : brander les primitifs **métier** (identifiants métier, quantités, codes, libellés porteurs de règles). **Ne pas** brander les **timestamps système** (`creation`/`modification` → `Date`) ni les ids d'infra sans invariant métier. En cas de doute : brander si le type a une **règle de validation** propre.              | INFO     | un `Date` système brandé ; une quantité métier (`number`) nue                              |
| DM-2    | Le **smart constructor** est le SEUL moyen de créer une instance. Jamais de `as` pour fabriquer une valeur.                                                                                                                                                                                                                                                                         | BLOCKER  | `rg " as [A-Z]" features` (hors `as const`)                                                |
| DM-3    | Chaque `\| null` doit être justifié. Si `null` cache un état → **discriminated union**.                                                                                                                                                                                                                                                                                             | BLOCKER  | `rg "\| null" features/*/domain` → vérifier sémantique                                     |
| DM-4    | Un **boolean qui partitionne** des champs → discriminated union (`anonyme: true/false`).                                                                                                                                                                                                                                                                                            | BLOCKER  | revue : booléen + champs conditionnels                                                     |
| DM-5    | **Deux champs encodant un seul état** → discriminated union (ex. `ContactTelephone`).                                                                                                                                                                                                                                                                                               | BLOCKER  | revue                                                                                      |
| DM-6    | `null` = une valeur d'enum → utiliser la **valeur par défaut** de l'enum, pas `null` (ex. `Genre('NonCommunique')`).                                                                                                                                                                                                                                                                | BLOCKER  | enum nullable dans une entité                                                              |
| DM-7    | Champs **toujours utilisés ensemble** → value object composite (ex. `CommuneResidence`).                                                                                                                                                                                                                                                                                            | WARN     | revue                                                                                      |
| DM-8    | Les **fonctions domaine** prennent des types **validés** (value objects), retournent des types validés, sont **pures** (0 effet, 0 import infra). Le parsing vit à la frontière.                                                                                                                                                                                                    | BLOCKER  | fonction domaine acceptant `string`/row Prisma                                             |
| DM-9    | Tous les champs d'entité sont `readonly`.                                                                                                                                                                                                                                                                                                                                           | WARN     | `rg "^\s+[a-zA-Z]+:" ` sans `readonly` dans un type entité                                 |
| DM-10   | **Transfer layer** (`implementations/prisma/`) : smart constructors Prisma→domaine (valide la DB) ; assignation naturelle domaine→Prisma (les branded types sont structurellement assignables) ; pas de `as`, pas de `!`, `?? defaultValue` + laisser le constructeur valider ; mapper `null ↔ NonCommunique`. **Round-trip test** obligatoire (domaine → fromDomain → toDomain = identité), min + max. | BLOCKER  | absence de `<entity>.transfer.spec.ts`                                                     |

> **Discriminants multiples (DM-4/DM-5).** Une entité réaliste en porte souvent plusieurs (ex. `anonyme` **et** `ContactTelephone` **et** synchro RDVSP). Choisir comme **discriminant racine** la partition la plus structurante (celle qui conditionne le plus de champs / la présence d'identité) ; modéliser les autres en **unions imbriquées** (value objects dédiés). Ne pas aplatir en une seule union géante, ni multiplier les discriminants racine.

---

## 3. Code style (CS) — partout

| ID   | Règle                                                                                                                                                                     | Sévérité | Détection                                        |
|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------|
| CS-1 | **Zéro `let`** — tout `const`.                                                                                                                                            | BLOCKER  | `rg "\blet \b" <diff>`                           |
| CS-2 | **Zéro `else`** — early returns, ternaires, pattern matching.                                                                                                             | WARN     | `rg "\} else" <diff>`                            |
| CS-3 | **Zéro `for`/`for...of`** — `map`/`filter`/`reduce`/`find`.                                                                                                               | WARN     | `rg "\bfor *\(" <diff>`                          |
| CS-4 | **Zéro mutation** — spread / méthodes fonctionnelles.                                                                                                                     | WARN     | `push(`, `splice(`, réassignation                |
| CS-5 | **Zéro `as`** (sauf `as const`) et **zéro `!`** (non-null).                                                                                                               | BLOCKER  | `rg " as [A-Z]\| as '\|!\." `                    |
| CS-6 | Tables de données déclaratives > cascades if/else.                                                                                                                        | INFO     | —                                                |
| CS-7 | Extraire pour **nommer** (le « quoi »), pas pour la taille.                                                                                                               | INFO     | —                                                |
| CS-8 | Helper pluriel : `libraries/pluriel` (Intl.PluralRules), **pas** `sPluriel`/`pluralize` (bug du 0 en français).                                                           | WARN     | `rg "sPluriel\|pluralize"`                       |
| CS-9 | Pas de variante **faiblement typée** en doublon d'un helper domaine. Extraire la règle commune en primitive basse-altitude ; le helper brandé y délègue (1 seule source). | WARN     | deux helpers même rôle, l'un à entrée `{a?, b?}` |

> Note : `tsc` n'attrape pas tout (ex. frontière client/serveur d'un barrel `libraries/data-table` casse en build prod) → vérifier `pnpm build` en cas de doute sur les barils mixtes ; les hooks portent `'use client'`.

---

## 4. Structure d'une ability (AB)

```
abilities/<ability>/
├── <ability>.ability.md         # Gherkin (BDD), voir §7
├── <ability>.steps.ts           # steps Cucumber
├── action/                      # contrats d'action : fournis par l'ability ou consommés par elle
│   ├── <ability>.validation.ts  # schéma Zod de l'input (form/wire shape)
│   ├── <ability>.errors.ts      # map erreur domaine → message
│   ├── <ability>.key.ts         # clé d'injection (ST-6)
│   └── <saisie>.transfer.ts     # traduction de la saisie validée vers le domaine
├── domain/                      # si logique métier propre à l'ability
│   ├── <ability>.ts (+ .spec.ts)# signatures de port + cas d'usage pur
│   └── index.ts                 # barrel admis (ST-2)
├── implementations/
│   ├── <technique>/             # prisma/ (<x>.query.ts, <x>.mutation.ts), excel/, email/, api/…
│   └── <x>.binding.ts           # seul fichier admis à la racine (ST-4)
└── ui/                          # par rôle, voir UI-7
```

Pas d'`index.ts` à la racine d'une ability ; pas de `commands/`, `queries/` ni d'autre dossier.

| ID   | Règle                                                                                                                                                                  | Sévérité | Détection                                                     |
|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------------------------------------------------------|
| AB-1 | Ability **avec server action** → contrats groupés dans `action/` (`validation` + `errors` [+ `key`]). Ability **query/pure** → **pas** de dossier `action/`.           | BLOCKER  | `validation.ts` à la racine de l'ability au lieu de `action/` |
| AB-2 | Modèle d'input **partagé** entre abilities → vit dans `features/<feature>/domain/` (pas dans une ability). Plus généralement, tout dossier autorisé dans une ability (`action/`, `ui/`, `implementations/`…) peut **remonter à la racine de la feature** sous le même nom quand son code est commun à plusieurs abilities et que la mutualisation est pertinente. Une ability n'importe jamais une autre ability ; quand l'une consomme le résultat d'une autre, c'est l'entrée (`app`, job) qui l'injecte. En production, la racine n'importe jamais une ability : l'assemblage de plusieurs abilities se fait dans l'entrée, et le typage des ports exige chaque pièce. Seul le code de test de la racine (`fixtures/`, `*.cucumber.ts`, tests d'intégration d'un assemblage) peut importer les abilities de sa propre feature. | BLOCKER  | `rg "abilities/<other>/" abilities/<self>`                    |
| AB-3 | La query/mutation Prisma est **owner-scopée** (`where: { …, mediateurId, suppression: null }`).                                                                        | BLOCKER  | mutation/query sans filtre propriétaire                       |
| AB-4 | Le branding (smart constructors) vit dans l'ability **propriétaire** ; le hub passe des ids, pas des entités brandées d'une autre ability.                             | WARN     | hub qui brande pour le compte d'une autre ability             |
| AB-5 | Erreurs retournées en `Result<T, E>` discriminé (pas de `throw` métier).                                                                                               | WARN     | `throw new` dans une mutation/query                           |
| AB-6 | Pas de barrel à la racine d'une ability : les consommateurs importent le fichier qui définit le symbole (ST-2). Le code d'orchestration pur d'une ability vit dans `domain/<ability>.ts`, et reçoit ses dépendances par ses ports. | BLOCKER  | `index.ts` à la racine d'une ability ; dossier `commands/` |

---

## 5. Isolation (IS)

| ID   | Règle                                                                                                                                                               | Sévérité | Source                                 |
|------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------------|
| IS-1 | **Pas de dépendance inter-ability** dans une même feature : duplication découplée > couplage. Code partagé → 3 stratégies : feature-level domain, ou library.       | BLOCKER  | `feedback_no_cross_ability_dependency` |
| IS-2 | **Pas de dépendance inter-feature** : aucun import du code d'une autre feature, `index.ts` compris (cf. AR-2/AR-3, port + injection depuis `app/`).                 | BLOCKER  | idem                                   |
| IS-3 | Quand on **déplace** du code consommé ailleurs : grep **tout** le dépôt (`src`, `e2e`, `.storybook`, la configuration), repointer **tous** les consommateurs (specs relatifs inclus). | BLOCKER  | build cassé post-move                  |

---

## 6. UI (UI)

| ID   | Règle                                                                                                                                                                                                                                                                    | Sévérité | Détection                                                        |
|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------|
| UI-1 | **`app` ne contient que Next et la composition** : ce que Next exige (`metadata`, `params`, `redirect`, `<html>` du layout racine…), l'authentification, la préparation des données par les abilities, et l'assemblage : **une** page ou **un** layout de feature, avec ses injections (`ClientBinder`), ses enfants et ses slots venus d'autres abilities ou features. Aucun balisage ni composant d'UI dans une route. | BLOCKER  | balise HTML ou composant DSFR dans `app/**` hors layout racine |
| UI-2 | **Pas de `*.module.css`** : convertir en utilitaires DSFR (`fr-flex`, `fr-mb-8v`, `fr-sr-only`…). Seul le non-tokenisable (pixel-perfect, override global) va dans `styles/components/*.css`. Ne pas déplacer un module.css tel quel.                                    | BLOCKER  | `rg "\.module\.(css\|scss)" features`                            |
| UI-3 | Formulaires : **TanStack Form** via `libraries/formulaire` (`useAppForm`), **pas** react-hook-form. `import type { DefaultValues } from 'react-hook-form'` toléré. Mapping : `watch`→`useStore`, `setValue`→listeners de champ, inputs→`field.*`. Validation `validators.onSubmit`. | BLOCKER  | `rg "useForm\|Controller\|zodResolver\|useFormContext" features` |
| UI-4 | Mise en forme domaine→props dans un **presenter pur** (`*.presenter.ts`), pas dans le composant ni la route.                                                                                                                                                             | WARN     | logique de shaping dans `.tsx`/route                             |
| UI-5 | Input requis : marquer via `<RedAsterisk />` dans le label (DsfrInput n'a pas de prop `asterisk`).                                                                                                                                                                       | INFO     | —                                                                |
| UI-6 | Champ numérique optionnel : ramener `''→null` (listener) ; l'adaptateur `Input` affiche vide pour une valeur absente.                                                                                                                                                    | INFO     | —                                                                |
| UI-7 | **`ui/` par rôle** : `pages/` (`<Nom>Page.tsx`, conteneur racine d'un `page.tsx` de `app`), `layouts/` (`<Nom>Layout.tsx`, conteneur racine d'un `layout.tsx`), `slots/` (`<Nom>.slot.tsx`, composant que `app` injecte dans une page ou un layout), `components/` (constituants d'une page, composants seulement), `forms/` (`<Nom>Form.tsx`, champs `<Nom>Fields.tsx`, `<Nom>Field.tsx` ou `<Nom>ComboBox.tsx`, et leurs `.validation`, `.form-options`, `.form-data`). Un dossier, une catégorie : `presenters/` ne contient que des `.presenter.ts` (préparer des données pour l'affichage, liens et chemins compris), `labels/` des `.labels.ts` (libellés, vocabulaires, options, icônes, contenus affichés), `search-params/` des `.search-params.ts` (lecture et écriture de l'état d'URL), `columns/` des `.columns.ts(x)` (colonnes de tableau), `filtres/` des `.filtre.ts` (définition d'un filtre d'état d'URL), `hooks/` des hooks `use-<nom>.ts`. Un test ou une story porte le nom du fichier qu'il exerce et vit à côté de lui (`x.presenter.spec.ts` à côté de `x.presenter.ts`, `Nom.slot.stories.tsx` à côté de `Nom.slot.tsx`). Ce qui ne relève d'aucune de ces catégories n'y va pas : validation et valeurs de formulaire dans `forms/`, instance de modale dans `components/` comme un composant (`<Nom>.tsx`), règle métier dans `domain/`, utilitaire sans métier dans `libraries/`. Un type seul va dans le fichier qui produit ces données, sinon dans celui qui les consomme. Les liens sont vérifiés par `typedRoutes` : un chemin littéral reste dans le composant ; un chemin construit à partir de données est un gabarit `as const` dans un presenter ; un composant qui reçoit un lien le type `Route<T>` (générique) ; une adresse lue ou construite à l'exécution (chemin courant, retour, réponse d'une action) passe par `routeConstruite` ou `cheminInterne`, seules conversions admises ; un lien externe est un `<a>`, pas un `next/link`. Les pages vivent dans les abilities ; un composant ne remonte au niveau de la feature que si plusieurs abilities le partagent. | BLOCKER  | composant de `ui/` importé par `app` hors `pages/`, `layouts/`, `slots/` |

---

## 7. Tests (TS)

| ID   | Règle                                                                                                                                                                                                                                                            | Sévérité | Détection                                                                         |
|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------|
| TS-1 | **BDD sur CHAQUE ability** : `<ability>.ability.md` (Gherkin) + `<ability>.steps.ts`. C'est l'acceptation **et** le test d'intégration (DB réelle via Cucumber). **Exemption** : une ability de **pure consultation** n'a pas de spécification, parce qu'elle n'a aucune règle à décider : elle affiche ce qu'on lui passe, sans filtrage, droit, agrégation, calcul ni choix d'affichage conditionnel. Dès qu'elle décide quelque chose, même par un presenter ou une règle de domaine de sa feature, elle est spécifiée. Une feature **sans ability** qui porte une règle de domaine la spécifie à sa racine, dans `<feature>.feature.md` + `<feature>.steps.ts`. | BLOCKER  | ability sans `.ability.md` qui décide quelque chose                               |
| TS-2 | **Unit `.spec.ts` UNIQUEMENT là où il y a une logique pure isolable** (value object, règle métier, presenter). Query/projection sans logique → BDD seul (ne pas ajouter de spec vide).                                                                           | WARN     | spec ne testant qu'un objet littéral                                              |
| TS-3 | Fixtures via **smart constructors**, jamais `as Type`.                                                                                                                                                                                                           | BLOCKER  | `as` dans une fixture                                                             |
| TS-4 | Round-trip sur le transfer layer (cf. DM-10).                                                                                                                                                                                                                    | BLOCKER  | —                                                                                 |
| TS-5 | Steps Cucumber **globaux** : phrasés **uniques** entre fichiers (collision = `AmbiguousStepDefinition`). Hooks partagés dans `<feature>.cucumber.ts`. Lancer la suite entière (`pnpm test:cucumber`, DB 5433) — le scope par chemin en arg ne marche pas. | WARN     | deux `Given/When/Then` même texte                                                 |
| TS-6 | **Piège exceljs sous Cucumber (tsx/esm)** : un builder de classeur doit utiliser `import Excel from 'exceljs'; new Excel.Workbook()` (import **par défaut**). `import * as Excel` / `{ Workbook }` cassent sous tsx/esm.                                         | WARN     | `rg "import \* as Excel\|import \{ Workbook \}" ` dans un fichier couvert par BDD |
| TS-7 | Intégration locale : capper `DATABASE_URL` avec `&connection_limit=3` (sinon « too many clients »).                                                                                                                                                              | INFO     | —                                                                                 |

---

## 8. Process & discipline (PR)

| ID   | Règle                                                                                                                                                                                                       | Sévérité |
|------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| PR-1 | **Un incrément = une PR/commit** focalisé sur **un** cas d'usage. Déployable, ne casse pas la prod, tests existants verts.                                                                                  | BLOCKER  |
| PR-2 | **Design-first** : présenter le plan/modèle et **attendre** la validation avant d'éditer (ask before acting). Sur une décision à plusieurs options valides → question ciblée, pas de supposition.           | BLOCKER  |
| PR-3 | **Verify-before-delete** : ne rien supprimer sans avoir vérifié qu'un remplaçant existe **ET** est câblé. Regarder la cible avant d'écraser.                                                                | BLOCKER  |
| PR-4 | Séquence de gate **avant chaque commit** : `pnpm tsc` → `pnpm biome check --write <fichiers>` → tests ciblés (`test` / `test:integration` / `test:cucumber`) → commit.                               | BLOCKER  |
| PR-5 | **JAMAIS `git add -A`** (stage des `scripts/`, fichiers jetables → casse lint-staged). Toujours stager des **chemins précis** `src/...`.                                                               | BLOCKER  |
| PR-6 | Commits **Conventional Commits** : `type(scope)?: description` au présent ; corps = le **pourquoi** + le quoi en termes d'archi (pas la liste de fichiers). Types : `refactor`/`fix`/`test`/`feat`/`chore`. | WARN     |
| PR-7 | Construction **verticale, ability par ability** ; quand une ability en remplace du code existant, coexistence ancien/nouveau pendant la transition, puis suppression de l'ancien code une fois tout remplacé. | INFO     |
| PR-8 | Si gpg `signing failed` (pinentry) : ne pas contourner ; l'utilisateur déverrouille puis « recommence le commit » (rejouer le même `git commit`).                                                           | INFO     |
| PR-9 | Laisser mourir naturellement un vieux helper lâche avec les refactos progressives ; **ne pas** forcer une passe transverse prématurée.                                                                      | WARN     |

---

## 9. Choix assumés (DV) — NE PAS signaler comme violations

> Ces choix sont **décidés**. Un agent ne doit **jamais** les signaler comme des écarts.

| ID   | Choix                                                                                              | Pourquoi                                                                                    |
|------|----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| DV-1 | **Zod** + branded types (`defineModel`), pas Effect Schema                                         | Plus léger, familier de l'écosystème React (ADR-005)                                        |
| DV-2 | Une seule implémentation par port, dans `implementations/prisma/`                                    | Pas de multi-implémentation ni d'in-memory : Cucumber joue contre la **vraie base** (ADR-008) |
| DV-3 | Scénarios en `.ability.md` (Gherkin dans du markdown), pas `.feature`                              | Format en place dans tout le dépôt                                                          |
| DV-4 | Les routes orchestrent directement, sans builder de page                                           | Les quatre étapes d'une page restent lisibles sans abstraction (ADR-007)                    |
| DV-5 | Injection (`piqure`) adoptée **progressivement**                                                   | Introduite là où elle sert, pas imposée partout d'un coup (ADR-006)                         |
| DV-6 | Pas (encore) de mapping erreur → clé i18n                                                          | À venir, non bloquant                                                                       |
| DV-7 | Vitest (`.spec.ts` / `.integration.ts`) + Cucumber, sans isolation, sans mock ni espion            | `.integration.ts` reste une convention du dépôt (ADR-008)                                   |
| DV-8 | `defaultValues: {} as TFormData` dans `formOptions(…)`, `props: {} as {…}` dans `withForm(…)`        | Imposé par la signature de TanStack Form : ces options ne portent qu'un type, la valeur n'est jamais lue. Seule exception tolérée à CS-5 ; tout autre `as` reste BLOCKER (ADR-009). |


---

## 10. Ce sur quoi il faut insister (index condensé → règles)

> Vue « radar » pour `convention-reviewer` : les retours récurrents, pointant vers la règle.

- Modèle domaine complet **dès le départ** → §2 (DM-1…10). *Le plus gros levier (7 itérations sur `beneficiaire`).*
- Contrats d'ability dans `action/` ; input partagé en `domain/` de feature → AB-1, AB-2.
- Aucune dépendance inter-ability/feature ; duplication découplée > couplage → IS-1, IS-2.
- Vérifier le remplaçant **avant** suppression → PR-3.
- `app` ne garde que Next et la composition ; module.css→DSFR (pas de déplacement tel quel) → UI-1, UI-2.
- Pas de barrel hors `domain/index.ts` et `implementations/<technique>/index.ts` ; pas d'index d'ability ni de feature → ST-2, AB-6.
- kebab-case, français pour le métier, anglais pour la technique ; catégorie là où elle dit le rôle → ST-1, ST-5.
- `implementations/` par technique, `ui/` par rôle, clés seulement dans `action/` → ST-4, UI-7, ST-6.
- Fragment SQL partagé : un seul endroit, colonnes comprises, et chaque requête qui l'embarque testée → AR-7.
- Pas de helper faiblement typé en doublon (primitive partagée) → CS-9.
- Nommage : préfixes au **minimum** (instancier ≠ créer ; `beneficiaireListItem` pas `createABeneficiaire`) ; préfixe seulement s'il porte une info (`seed/to/from/with`) → (nommage).
- BDD = intégration sur chaque ability ; unit seulement si logique pure → TS-1, TS-2.
- Jamais `git add -A` ; gate avant commit ; présenter le plan puis attendre → PR-2, PR-4, PR-5.

---

### Maintenance de ce fichier
Quand un nouveau retour récurrent apparaît : ajouter une règle **avec ID** dans la bonne section + une ligne dans §10, et (si pertinent) une mémoire-feedback liée. Garder les entrées **terses et détectables**.
