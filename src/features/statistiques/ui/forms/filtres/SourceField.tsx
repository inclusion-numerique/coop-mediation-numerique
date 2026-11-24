import { activiteSourceOptions } from '@/features/statistiques/ui/labels/source-de-l-activite.labels'
import { withForm } from '@/libraries/formulaire/use-app-form'
import { plusDeFiltresFormOptions } from '../plus-de-filtres.form-options'

export const SourcesField = withForm({
  ...plusDeFiltresFormOptions,
  props: {} as {
    isPending: boolean
  },
  render: ({ form, isPending }) => (
    <form.AppField name="source">
      {(field) => (
        <field.RadioButtons
          isPending={isPending}
          isTiled={false}
          legend={
            <h2 className="fr-h6 fr-mb-0">
              Filtrer par source de la donnée&nbsp;:
            </h2>
          }
          options={activiteSourceOptions}
        />
      )}
    </form.AppField>
  ),
})
