import {
  ActiviteSource,
  activiteSourceOptions,
} from '@app/web/features/statistiques/ui/filtres/source'
import { withForm } from '@app/web/libs/form/use-app-form'
import { plusDeFiltresFormOptions } from './plus-de-filtres.form-options'

export const updateSourcesParams = (data: {
  value: { source?: ActiviteSource }
}) => ({
  source:
    data.value.source === 'v1' || data.value.source === 'v2'
      ? data.value.source
      : null,
})

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
