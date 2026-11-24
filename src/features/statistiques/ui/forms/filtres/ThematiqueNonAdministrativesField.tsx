import { withForm } from '@/libraries/formulaire/use-app-form'
import type { MotDuVocabulaire } from '../../labels/barre.labels'
import { plusDeFiltresFormOptions } from '../plus-de-filtres.form-options'

export const ThematiqueNonAdministrativesFiled = withForm({
  ...plusDeFiltresFormOptions,
  props: {} as {
    mots: readonly MotDuVocabulaire[]
    isPending: boolean
  },
  render: ({ form, isPending, mots }) => (
    <form.AppField name="thematiqueNonAdministratives">
      {(field) => (
        <field.Checkbox
          classes={{
            content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-0',
          }}
          isPending={isPending}
          isTiled={false}
          options={[...mots]}
        />
      )}
    </form.AppField>
  ),
})
