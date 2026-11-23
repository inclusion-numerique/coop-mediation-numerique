---
name: build-ability
description: >-
  Construire UNE ability (un cas d'usage) d'une feature au standard du dépôt — la tranche verticale =
  1 PR. Orchestre la boucle : conception du domaine d'abord (domain-modeler), scénario BDD écrit
  avant le code, implémentation (domaine → transfer → ability → action → route), auto-revue
  (convention-reviewer) AVANT la relecture humaine, puis gate et commit. À lancer pour chaque
  nouveau cas d'usage, une ability à la fois.
---

# /build-ability — tranche verticale d'une ability (= 1 PR)

Tu construis **une seule ability**, de bout en bout, en pré-emptant les retours.
Deux comportements portent tout le gain : **(1) décider le domaine AVANT de coder**, **(2) t'auto-relire
contre les conventions AVANT de montrer le travail à l'humain.**

## Référentiel

- Les règles : **`.claude/conventions/feature-architecture.md`** — lis-la, applique-la par ID, ne la
  duplique pas ici. Ce skill est le **process** ; la spec est la **règle**.
- Le pourquoi des règles : `docs/decisions/`, en particulier ADR-004 (features et abilities), ADR-005
  (domaine), ADR-006 (server actions et injection), ADR-007 (routes), ADR-008 (tests).
- Agents : `domain-modeler` (conception), `convention-reviewer` (auto-revue). *(S'ils ne sont pas
  enregistrés comme types de sous-agents — session non rechargée — émule-les : un agent générique
  qui lit `.claude/agents/<nom>.md` et la spec, et l'exécute.)*

## Points d'arrêt humains (PR-2 — présenter puis attendre)

Tu t'arrêtes et tu fais valider à **2 moments** (ne jamais supposer) :
- **A. Après la proposition de `domain-modeler`** (si le domaine n'est pas encore modélisé, ou si
  l'ability introduit de nouveaux concepts) — valider le modèle et trancher les questions ouvertes
  avant tout code.
- **B. Avant le commit** — présenter le diff et le rapport de `convention-reviewer` ; attendre le go.

Pour le reste (mécanique), avance.

## Étapes

### 0. Cadrer
- Nommer **l'ability** par son intention (`creer-…`, `lister-…`, `consulter-…`, `fusionner-…`) et
  situer sa feature. Si aucune feature ne l'accueille naturellement, c'est peut-être qu'il en manque
  une : le dire plutôt que de forcer.
- Fixer son contrat : entrée, sortie, erreurs ; lecture (query) ou écriture (mutation → server action).
- Si elle remplace du code existant, en repérer **tous** les consommateurs (grep `src`
  et `e2e` — IS-3).

### 1. Domaine — conception d'abord (point d'arrêt A)
- Domaine absent ou incomplet → lancer **`domain-modeler`**. Présenter son modèle et ses questions
  ouvertes → **attendre la validation** (A).
- Une fois validé (ou si le domaine existe déjà) : value objects, entité (unions discriminées),
  `errors.ts`, `index.ts`, selon §2 (DM-1…10) et §3.

### 2. Scénario d'abord (TDD)
- Écrire `<ability>.ability.md` (Gherkin) **avant** l'implémentation : c'est l'acceptation et
  l'intégration, contre une vraie base (TS-1). Phrasés **uniques** entre fichiers, hooks partagés
  dans `<feature>.cucumber.ts` (TS-5).
- Pour la logique pure (value object, règle métier, presenter) : le `.spec.ts` d'abord, qui échoue,
  puis le code minimal (TS-2). Pas de spec vide pour une query sans logique.

### 3. Transfer layer (première ability de la feature ou nouveaux champs)
- `implementations/prisma/<entity>.transfer.ts` : smart constructors Prisma → domaine, assignation naturelle
  domaine → Prisma, `null ↔ NonCommunique` (DM-10). Zéro `as` / `!`.
- `implementations/prisma/<entity>.transfer.spec.ts` : **aller-retour** min, max et chaque variante d'union (TS-4).

### 4. Implémenter l'ability (structure §4)
```
abilities/<ability>/
├── <ability>.ability.md · <ability>.steps.ts
├── implementations/<technique>/…                          # prisma/<x>.{query|mutation}.ts filtrée par propriétaire (AB-3)
├── action/<ability>.{validation,errors,key}.ts           # SI server action (AB-1, ST-6)
├── domain/<ability>.ts (+ .spec.ts)                       # ports + cas d'usage pur
└── ui/pages · components · forms · slots …                # par rôle (UI-7)
```
Pas d'`index.ts` à la racine de l'ability (AB-6) ; nommage et catégories : ST-1, ST-5.
- Pas de dépendance vers une autre ability (IS-1) ni vers une autre feature (IS-2) : port dans le
  domaine, implémentation fournie depuis la route.
- Code commun à plusieurs abilities → remonte à la racine de la feature, sous le même nom (AB-2).
- `action/` et `ui/` n'importent jamais `implementations/`.

### 5. Câbler
- **Mutation** : `src/app/_actions/<feature>/<ability>.action.ts`, construite avec
  `actionBuilder()`. Jamais de `'use server'` dans un composant.
- **Composant client** : reçoit l'action par `inject(KEY)` ; la route la lie avec
  `<ClientBinder bind={KEY} to={action}>`.
- **Route** = hub mince (AR-5, ADR-007) : contrôle d'accès → entrées via value object → données via
  l'**ability** (jamais `prismaClient` dans `app/`) → rend **une** page de la feature, et lui injecte
  en slots ce qui vient d'autres abilities ou features. Aucun balisage dans la route (UI-1).
- **Formulaire** : `/build-form` (TanStack Form, UI-3).
- Si l'ability remplace du code : coexistence le temps de la transition (PR-7), puis suppression
  seulement une fois le remplaçant câblé (PR-3).

### 6. Auto-revue — pré-empter (AVANT de montrer à l'humain)
- Lancer **`convention-reviewer`** (ou le workflow `review-increment`) sur le diff.
- **Corriger toi-même les BLOCKER** (et les WARN, sauf justification explicite) avant le point
  d'arrêt B.

### 7. Gate et commit (point d'arrêt B)
- `/gate` : types → Biome → tests ciblés.
- Présenter à l'humain : résumé du diff + rapport `convention-reviewer` → **attendre le go (B)**.

## Définition de « terminé »
Structure §1/§4 conforme · domaine §2/§3 conforme · scénario BDD (TS-1) · `convention-reviewer` :
0 BLOCKER · gate vert · code remplacé supprimé seulement si le remplaçant est câblé (PR-3) · une PR
focalisée (PR-1). Si un **nouveau** retour récurrent émerge : l'ajouter à la spec (voir sa section
« Maintenance »).
