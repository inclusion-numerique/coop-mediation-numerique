import {
  optionsDesSources,
  SourceDansLURL,
} from '@app/web/features/activites/ui/libelles/source-de-l-activite'
import { withForm } from '@app/web/libs/form/use-app-form'
import { plusDeFiltresFormOptions } from './plus-de-filtres.form-options'

export const updateSourcesParams =
  (params: URLSearchParams) =>
  (data: { value: { source?: SourceDansLURL } }) => {
    data.value.source !== 'v1' && data.value.source !== 'v2'
      ? params.delete('source')
      : params.set('source', data.value.source)
  }

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
          options={[...optionsDesSources]}
        />
      )}
    </form.AppField>
  ),
})
