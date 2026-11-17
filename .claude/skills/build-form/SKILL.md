---
name: build-form
description: >-
  Écrire un formulaire avec TanStack Form (libs/form, useAppForm) : adaptateurs de champs, logique
  entre champs, validation, soumission par server action injectée, et pièges connus. Sert aussi à
  réécrire un des formulaires qui utilisent encore react-hook-form (tableau de correspondance en
  annexe).
---

# /build-form — formulaire TanStack Form (UI-3)

Argument : le **formulaire** à écrire (ou à réécrire). Références : `src/libs/form`
(`useAppForm`, `handle-submit`), un formulaire existant comme modèle (`CraIndividuelForm`), et
ADR-009 (`docs/adr/`) pour le pourquoi.

## Construire

- **Valeurs et validation** : un schéma Zod dans `action/<ability>.validation.ts` décrit l'entrée de
  la server action. Le formulaire parle le vocabulaire du domaine ; la traduction se fait à une seule
  frontière.
- **Options** : `formOptions({ defaultValues: {} as TFormData, … })` — seule exception tolérée aux
  `as` (DV-8).
- **Champs** : `<form.AppField name="…">{(field) => <field.Input … />}</form.AppField>`, avec les
  adaptateurs enregistrés dans `use-app-form.ts` (`fieldComponents`).
- **Validation** : `validators: { onSubmit }` (pas `onChange` : `field.Input` n'attend pas
  `isTouched`, les erreurs apparaîtraient trop tôt).
- **Soumission** : la server action arrive par injection (`inject(KEY)`, ADR-006) ;
  `<form.AppForm><form onSubmit={handleSubmit(form)}>…` ; bouton `form.Submit` avec `isPending`
  (`useStore(form.store, (s) => s.isSubmitting)`).
- **Mise en forme** domaine → valeurs par défaut dans un **presenter pur** (UI-4), pas dans le
  composant ni la route.

## Logique entre champs
- Lire une valeur : `useStore(form.store, (s) => s.values.x)`.
- Réagir à un changement : `<form.AppField listeners={{ onChange }}>` + `form.setFieldValue`.

## Pièges connus
- **Champ numérique optionnel** : listener `'' → null` ; l'adaptateur `Input` affiche vide pour une
  valeur absente (UI-6).
- **Champ requis** : `<RedAsterisk />` dans le label (l'`Input` DSFR n'a pas de prop `asterisk`, UI-5).
- **Champ sans adaptateur** : **point d'arrêt humain** — construire l'adaptateur d'abord, calqué sur
  le composant DSFR, l'enregistrer dans `use-app-form.ts` (lazy), puis l'utiliser.
- **Texte riche** : `field.RichTextarea` réutilise la barre d'outils de `libraries/ui`, dont la modale
  de lien est encore en react-hook-form.
- **exceljs sous Cucumber** : un classeur construit dans un code exercé par BDD fait
  `import Excel from 'exceljs'` (TS-6).
- **E2E Cypress** : cliquer le bouton de soumission, jamais `cy.get('form').submit()` (course avec le
  store TanStack).

## Étapes
1. **Inventaire des champs** → chacun a-t-il un adaptateur ? Sinon, arrêt humain.
2. **Écrire** le formulaire, extraire un presenter pur si mise en forme.
3. **Scénario** : couvrir la soumission dans le `.ability.md` de l'ability (TS-1).
4. **Auto-revue** (`convention-reviewer`) → `/gate` → PR. Vérifier le **build** de production si un
  barrel mélange client et serveur.

## Annexe — réécrire un formulaire react-hook-form

| react-hook-form (`libraries/ui/.../Form/*`) | TanStack (`libs/form`)                                      |
|----------------------------------------|-------------------------------------------------------------|
| `InputFormField` (texte, nombre, e-mail) | `field.Input`                                             |
| `CheckboxFormField`                    | `field.Checkbox`                                            |
| `RadioFormField` (cartes riches)       | `field.RadioButtons` (`legend` + `classes.content`)          |
| `RichTextFormField`                    | `field.RichTextarea`                                        |
| `AdresseBanFormField`                  | `field.ComboBox` + `CommuneComboBox`/`CommuneOptions` + `Options` |
| `FileFormField`                        | `field.File` (adaptateur DSFR `Upload`)                     |
| `SelectFormField`                      | `field.Select` / `field.MultiSelect`                        |

- `watch(x)` → `useStore(...)` ; `setValue` → listeners + `form.setFieldValue`.
- Un `mediateurId` vestigial dans les valeurs → schéma **local** `Validation.extend({ mediateurId })`,
  jamais dans le schéma partagé des server actions.
- Une liste d'options par défaut redondante (ex. `communeResidenceDefaultOptions`) → supprimer : la
  ComboBox lit `defaultValues`.
- Nettoyer ensuite les props et les types devenus inutiles chez les consommateurs.
