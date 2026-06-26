---
name: migrate-ability
description: >-
  Migrer (ou créer) UNE ability d'une feature au standard COOP — la tranche verticale = 1 PR.
  Orchestre la boucle : design-first du domaine (domain-modeler), implémentation
  (domaine→transfer→ability→action→route→BDD), auto-revue (convention-reviewer) AVANT la review
  humaine, puis gates + commit. À lancer pour chaque cas d'usage à migrer, une ability à la fois.
---

# /migrate-ability — tranche verticale d'une ability (= 1 PR)

Tu migres **une seule ability** au standard cible, de bout en bout, en pré-emptant les retours.
Deux comportements portent tout le ROI : **(1) décider le domaine AVANT de coder**, **(2) m'auto-relire
contre les conventions AVANT de montrer le travail à l'humain.**

## Référentiel

La spec normative est **`.claude/conventions/feature-architecture.md`** — lis-la, applique-la par ID,
ne la duplique pas ici. Ce skill est le **process** ; la spec est la **règle**. Agents mobilisés :
`domain-modeler` (design), `convention-reviewer` (auto-revue). *(S'ils ne sont pas enregistrés comme
subagent types — session non rechargée — émule-les : un agent générique qui lit
`.claude/agents/<nom>.md` + la spec et l'exécute.)*

## Points d'arrêt humains (PR-2 — présenter puis attendre)

Tu t'arrêtes et tu fais valider à **2 moments** (ne jamais supposer) :
- **A. Après la proposition `domain-modeler`** (si le domaine n'est pas encore modélisé) — valider le modèle + trancher les questions ouvertes avant tout code.
- **B. Avant le commit** — présenter le diff + le rapport `convention-reviewer` ; attendre le go.

Pour le reste (mécanique), avance.

## Étapes

### 0. Cadrer
- Identifier **l'ability** (un cas d'usage : `creer-…`, `lister-…`, `consulter-…`, `fusionner-…`…) et la feature.
- Déterminer son contrat : input, output, erreurs ; lecture (query) ou écriture (mutation → server action).
- Repérer le code legacy à remplacer (router tRPC, validation, composants, route) et **tous** ses consommateurs (grep `apps/web/src` **et** `packages/` — IS-3).

### 1. Domaine — design-first (point d'arrêt A)
- Si le `domain/` de la feature **n'est pas encore modélisé** (ou l'ability introduit de nouveaux concepts) → lancer **`domain-modeler`** sur la feature/entité. Présenter son modèle + questions ouvertes → **attendre la validation** (A).
- Une fois validé (ou si le domaine existe déjà) : créer/compléter les value objects, l'entité (unions discriminées), `errors.ts`, `index.ts`, en suivant §2 (DM-1…10) et §3. Tests unitaires domaine **uniquement si logique pure** (TS-2).

### 2. Transfer layer (si première ability de la feature ou nouveaux champs)
- `db/<entity>.transfer.ts` : smart constructors Prisma→domaine, assignation naturelle domaine→Prisma, mapping `null ↔ NonCommunique` (DM-10). 0 `as`/`!`.
- `db/<entity>.transfer.spec.ts` : **round-trip** min + max + chaque variante d'union (TS-4).

### 3. Implémenter l'ability (structure §4)
```
abilities/<ability>/
├── implementation/prisma/<ability>.{query|mutation}.ts   # owner-scopé (AB-3)
├── implementation/prisma/index.ts · implementation/index.ts
├── action/<ability>.{validation,errors}.ts [+ .key.ts]   # SI mutation/server action (AB-1)
├── domain/<ability>.ts (+ .spec.ts)                       # si logique propre à l'ability
├── ui/  → *.presenter.ts (pure) + components/ + pages/    # §6
└── index.ts
```
- Query/mutation **owner-scopée** (`where: { …, mediateurId, suppression: null }`).
- Input partagé entre abilities → dans `features/<feature>/domain/`, pas dans une ability (AB-2).
- Pas de dépendance inter-ability (IS-1).

### 4. Câbler
- **Mutation** : `app/_actions/<feature>/<ability>.action.ts` (server action). 
- **Route = hub mince** (AR-5) : auth → input via value object/schema → données via l'**ability query** (jamais `prismaClient` brut) → rend **un** composant page de la feature. Concerns croisés injectés en slots.
- **Formulaire** : TanStack `useAppForm` (UI-3), jamais react-hook-form.
- **Adapter les consommateurs** existants : router tRPC → appelle l'ability ; REST v1 → appelle l'ability. Coexistence ancien/nouveau OK (PR-7). Avant toute suppression : **verify-before-delete** (PR-3).

### 5. Tests (§7)
- **BDD obligatoire** : `<ability>.ability.md` (Gherkin) + `<ability>.steps.ts` (phrasés **uniques**, hooks dans `<feature>.cucumber.ts`). C'est l'acceptation **et** l'intégration (DB réelle).
- Unit `.spec.ts` **seulement** pour la logique pure (TS-2). Ne pas ajouter de spec vide pour une query/projection.

### 6. Auto-revue — pré-empter (AVANT de montrer à l'humain)
- Lancer **`convention-reviewer`** sur le diff de l'incrément.
- **Corriger toi-même les BLOCKER** (et les WARN sauf justification explicite) avant le point d'arrêt B. C'est ici qu'on tue les retours.

### 7. Gate & commit (point d'arrêt B)
- Séquence (PR-4) : `pnpm -F web tsc` → `pnpm biome check --write <fichiers>` → tests ciblés (`test` / `test:integration` / `test:cucumber`, DB 5433).
- Présenter à l'humain : résumé du diff + rapport `convention-reviewer` (résiduels assumés) → **attendre le go (B)**.
- Commit : **stager des chemins précis** `apps/web/...` / `packages/...` (**jamais `git add -A`** — PR-5) ; message Conventional Commits, présent, corps = le pourquoi (PR-6). Si gpg `signing failed` → l'humain déverrouille puis « recommence le commit » (PR-8).

## Définition de « terminé »
- Structure §1/§4 conforme · domaine §2/§3 conforme · BDD présent (TS-1) · `convention-reviewer` : 0 BLOCKER · gates verts · consommateurs adaptés · ancien code supprimé seulement si remplaçant câblé (PR-3) · 1 commit focalisé (PR-1).
- Mettre à jour la spec/les mémoires si un **nouveau** retour récurrent émerge (boucle d'apprentissage).
