---
name: build-feature
description: >-
  Construire une feature ENTIÈRE au standard du dépôt, verticalement, ability par ability. Découpe la
  feature en cas d'usage, les ordonne, modélise le domaine partagé (domain-modeler), puis enchaîne
  /build-ability sur chacun, et finit par un audit. À lancer pour une nouvelle feature, ou pour en
  remplacer une existante de bout en bout.
---

# /build-feature — construction verticale d'une feature complète

Tu orchestres la construction d'une feature de bout en bout. **Une ability = 1 PR.** L'essentiel est
délégué à `/build-ability` ; ce skill-ci gère le **découpage, l'ordre, le domaine partagé et la
fin**.

Argument : le **nom de la feature**. Référentiel : `.claude/conventions/feature-architecture.md` ;
le pourquoi : ADR-004 (features et abilities) et ADR-005 (domaine) dans `docs/decisions/`.

## Points d'arrêt humains (PR-2)
- **A. Après le découpage** : valider la liste des abilities et leur ordre.
- **B. Modèle de domaine** : valider la proposition de `domain-modeler`.
- (+ les arrêts internes à chaque `/build-ability`.)

## Étapes

1. **Délimiter.** Une feature couvre un périmètre fonctionnel complet, administration et statistiques
   comprises (ADR-004). Vérifier qu'elle ne recouvre pas une feature existante : si oui, l'étendre
   plutôt que d'en créer une. Calibrer l'effort de modélisation au sous-domaine (AR-6).
2. **Découper.** Lister les cas d'usage, un par ability, nommés par leur intention. Définir l'**ordre**
   (le plus petit et le plus clair d'abord ; une lecture avant les écritures qui en dépendent). Si la
   feature en remplace une existante : repérer l'ancien code et **tous** ses consommateurs (grep
   `src` et `e2e`). → **attendre (A)**.
3. **Modéliser le domaine partagé.** Lancer **`domain-modeler`** une fois pour la feature → présenter,
   trancher les questions ouvertes → **attendre (B)**. Puis créer `domain/` (value objects, entité,
   erreurs, index) et le transfer `implementations/prisma/` avec son test aller-retour (DM-10, TS-4).
4. **Enchaîner `/build-ability`** sur chaque ability, dans l'ordre. Chacune : scénario BDD →
   implémentation → auto-revue → gate → PR. En cas de remplacement : coexistence ancien/nouveau
   (PR-7), rien supprimé sans remplaçant câblé (PR-3).
5. **Finir.** Supprimer l'ancien code devenu mort (vérifier d'abord que plus rien ne l'importe), puis
   lancer **`/audit-feature`** → viser **0 résidu réel**. Si un retour récurrent nouveau est apparu :
   l'ajouter à la spec.

## Garde-fous
- Chaque PR est déployable, la prod reste intacte, les tests existants restent verts (PR-1).
- Pas de dépendance entre features au niveau du domaine (IS-2) : port local + implémentation fournie
  depuis la route (AR-3, ADR-007).
