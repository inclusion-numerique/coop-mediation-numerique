# ADR-009 : Formulaires avec TanStack Form

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                      |
| ---------- | ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2025-06-05 | Marc Gavanier | Premier formulaire migré : la saisie d'activité (CRA) passe à TanStack Form, avec `libs/form` et `useAppForm` (`1107273d1`) |
| 2026-06-26 | Marc Gavanier | Le formulaire du bénéficiaire passe à TanStack Form (`b2b1d4f5a`)                                                           |
| 2026-06-26 | Marc Gavanier | Le formulaire d'import des bénéficiaires suit, avec un premier adaptateur de champ fichier (`cd64af88c`)                    |
| 2026-06-26 | Marc Gavanier | Règle UI-3 dans les conventions : TanStack Form via `libs/form`, pas react-hook-form (`9e7dbc659`)                          |
| 2026-09-02 | Marc Gavanier | Divergence DV-8 : `defaultValues: {} as TFormData` et `props: {} as {…}` tolérés, seule exception à CS-5 (`cc6d7e1e7`)      |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                   |

## Statut

Accepté — migration progressive. Les nouveaux formulaires utilisent TanStack Form ; des
formulaires anciens restent sur react-hook-form.

## Contexte

Les formulaires reposaient sur react-hook-form. Chaque champ passait par un composant
`*FormField` de `packages/ui` (`InputFormField`, `RadioFormField`, `SelectFormField`…), qui
enveloppait un `Controller` de react-hook-form autour du composant DSFR. La logique entre champs
s'écrivait avec `watch` et `setValue`.

Ces enveloppes recevaient un `control` et un nom de champ ; le schéma Zod se branchait par un
résolveur (`zodResolver`). Tout nouveau champ demandait une enveloppe de plus dans `packages/ui`,
hors de la feature qui l'utilisait.

## Décision

### `useAppForm` pour tout nouveau formulaire

Un formulaire se construit avec `useAppForm` (ou `withForm` pour un sous-formulaire), exportés par
`apps/web/src/libs/form/use-app-form.ts`. `libs/form` porte :

- les adaptateurs de champ (`fields-components/`) : `Input`, `Checkbox`, `RadioButtons`,
  `Select`, `MultiSelect`, `ComboBox`, `Calendar`, `RichTextarea`, `File`… Chacun enveloppe le
  composant DSFR correspondant et s'utilise par `field.<Adaptateur>` ;
- le bouton de soumission (`form-components/`) ;
- `handle-submit.ts` et `handle-action.ts`, qui relient la soumission à une server action
  (ADR-006).

La logique entre champs se traduit ainsi : `watch` devient `useStore(form.store, selector)`,
`setValue` devient un `listeners.onChange` sur le champ concerné. La validation se pose sur
`validators.onSubmit`, pour ne pas afficher d'erreur avant la première soumission.

### Le type de la valeur est celui du schéma

TanStack Form exige que le type de la valeur du formulaire soit celui de l'entrée du validateur.
Quand le formulaire porte un champ que le schéma partagé n'a pas, on étend le schéma localement,
dans le formulaire ; on ne modifie pas le schéma de l'action.

### Une seule exception aux `as`

`formOptions({ defaultValues: {} as TFormData })` et `withForm({ props: {} as {…} })` sont imposés
par la signature de la bibliothèque : ces deux options ne portent qu'un type, leur valeur n'est
jamais lue. C'est la seule exception tolérée à l'interdiction des `as` (DV-8). Tout autre `as`
reste interdit.

### Détail normatif

`.claude/conventions/feature-architecture.md` : UI-3 (TanStack Form, mapping des champs), UI-5
(marque des champs requis), UI-6 (champ numérique optionnel), DV-8 (exception aux `as`), CS-5
(zéro `as`).

## Alternatives écartées

### Garder react-hook-form

Il aurait fallu conserver la couche d'enveloppes `*FormField` et ses `Controller`. La migration
était déjà engagée depuis juin 2025 avec la saisie d'activité : la poursuivre évitait de garder
deux façons d'écrire un formulaire neuf.

### Migrer tous les formulaires d'un coup

La migration suit celle des features, ability par ability (PR-7). Un formulaire passe à TanStack
Form quand sa feature est reprise, pas dans une passe transverse.

## Conséquences

Positives :

- Les champs de la feature n'ont plus d'enveloppe intermédiaire dans `packages/ui` : un formulaire
  migré n'utilise que `libs/form`. Le `FileFormField` de `packages/ui`, devenu orphelin, a été
  supprimé avec la migration de l'import des bénéficiaires.
- Le type de la valeur du formulaire est celui de l'entrée du validateur : un écart entre les deux
  se voit à la compilation.

Négatives :

- Deux moteurs de formulaire coexistent. Au 17/11/2026, 32 fichiers importent encore
  `react-hook-form` :
  - 2 formulaires de l'application l'instancient encore avec `useForm` : la connexion par e-mail
    (`EmailSigninForm.tsx`) et la modale de lien de l'éditeur de texte riche
    (`packages/ui/…/RichTextLinkModalForm.tsx`). Cette modale est embarquée par la barre d'outils
    de l'éditeur, que l'adaptateur `field.RichTextarea` réutilise : un formulaire TanStack qui a un
    champ de texte riche charge donc encore react-hook-form ;
  - 7 stories et 1 test de composant Cypress l'instancient pour exercer les anciens champs ;
  - les autres sont les anciens champs `*FormField` de `packages/ui` et des fichiers qui n'en
    importent que des types (`DefaultValues`, `FieldValues`…).
- `react-hook-form` reste une dépendance de `apps/web`, `packages/ui` et `packages/e2e` tant que
  ces fichiers existent.
- Les adaptateurs de `libs/form` n'ont pas tous la même surface que l'ancien champ : `field.Input`
  n'a pas de prop `asterisk`, et un champ numérique vidé émet `''`, qu'un listener doit ramener à
  `null` (UI-5, UI-6).

## Références

- `apps/web/src/libs/form/`
- `apps/web/src/features/beneficiaire/forms/BeneficiaireForm.tsx`

## ADR liés

- [ADR-004 : Architecture par features et abilities](./adr-004-architecture-par-features-et-abilities.md)
- [ADR-006 : Server actions et injection, à la place de tRPC](./adr-006-server-actions-et-injection.md)
