import { withForm } from '@/libraries/formulaire/use-app-form'
import type { MotDuVocabulaire } from '../../labels/barre.labels'
import { plusDeFiltresFormOptions } from '../plus-de-filtres.form-options'

export const TypesField = withForm({
  ...plusDeFiltresFormOptions,
  props: {} as {
    mots: readonly MotDuVocabulaire[]
    isPending: boolean
  },
  render: ({ form, isPending, mots }) => (
    <form.AppField name="types">
      {(field) => (
        <field.Checkbox
          isPending={isPending}
          isTiled={false}
          legend={
            <h2 className="fr-h6 fr-mb-0">
              Filtrer par type d’activité&nbsp;:
            </h2>
          }
          options={[...mots]}
        />
      )}
    </form.AppField>
  ),
})
