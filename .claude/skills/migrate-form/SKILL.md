---
name: migrate-form
description: >-
  Migrer un formulaire de react-hook-form vers TanStack Form (libs/form useAppForm), avec le mapping
  d'inputs, la logique inter-champs et les pièges connus. À lancer pour chaque formulaire legacy RHF.
---

# /migrate-form — react-hook-form → TanStack (UI-3)

Argument : le **composant formulaire** à migrer. Références : `libs/form` (`useAppForm`,
`handle-submit`), un form déjà migré comme modèle (`CraIndividuelForm`), et la mémoire
`forms_rhf_to_tanstack_migration`.

## Mapping des inputs

| RHF (`@app/ui/.../Form/*`) | TanStack (`libs/form`) |
|----|----|
| `InputFormField` (texte/number/email) | `field.Input` |
| `CheckboxFormField` | `field.Checkbox` |
| `RadioFormField` (rich cards) | `field.RadioButtons` (`legend` + `classes.content`) |
| `RichTextFormField` | `field.RichTextarea` |
| `AdresseBanFormField` | `field.ComboBox` + `CommuneComboBox`/`CommuneOptions` + `Options` |
| `FileFormField` | `field.File` (adaptateur DSFR `Upload`) |
| `SelectFormField` | `field.Select` / `field.MultiSelect` |

## Logique inter-champs & submit
- `watch(x)` → `useStore(form.store, (s) => s.values.x)`
- `setValue` → `<form.AppField listeners={{ onChange }}>` + `form.setFieldValue`
- **Validation** : `validators: { onSubmit }` (PAS `onChange` — `field.Input` n'attend pas `isTouched`, sinon erreurs prématurées).
- **Submit** : `<form.AppForm><form onSubmit={handleSubmit(form)}>…` ; bouton `form.Submit isPending`.
- `isPending` = `useStore(form.store, (s) => s.isSubmitting)`.

## Pièges connus (mémoire + RETEX session)
- **`mediateurId` vestigial** dans les values → schéma **local** `Validation.extend({ mediateurId: z.string() })`. NE PAS l'ajouter au schéma partagé consommé par les server actions.
- **Champ numérique optionnel** : listener `'' → null` ; l'adaptateur `Input` affiche vide pour une valeur absente (UI-6).
- **Requis** : `<RedAsterisk />` dans le label (DsfrInput n'a pas de prop `asterisk`, UI-5).
- **`communeResidenceDefaultOptions`** souvent redondant → supprimer (la ComboBox lit `defaultValues`).
- **Input non géré** : si un type d'input n'a pas d'adaptateur `libs/form` → **point d'arrêt humain**, le construire d'abord (calqué sur le composant DSFR), l'enregistrer dans `use-app-form.ts` (`fieldComponents`, lazy), puis migrer.
- **exceljs sous Cucumber** : un builder de classeur exercé par BDD doit faire `import Excel from 'exceljs'` (TS-6).
- **E2E Cypress** : ne pas utiliser `cy.get('form').submit()` (course avec le store TanStack → la valeur du champ peut ne pas être posée) — **cliquer le bouton** (parcours réel).

## Étapes
1. **Inventaire des inputs** du form → vérifier que chacun a un adaptateur. Inputs non gérés → arrêt humain (les construire ensemble).
2. **Réécrire** le form (`useAppForm` + mapping), extraire un **presenter pur** si shaping.
3. **Nettoyer** les consommateurs (props devenues inutiles) et leurs types.
4. **Auto-revue** (`convention-reviewer`) → **gate** (`/gate`) → commit. Vérifier le **build** prod si barils client/serveur mixtes (frontière `libs/data-table`).
