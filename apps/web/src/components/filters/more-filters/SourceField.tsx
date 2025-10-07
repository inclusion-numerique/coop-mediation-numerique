import {
  ActiviteSource,
  activiteSourceOptions,
} from '@app/web/features/activites/use-cases/source/activiteSource'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { formOptions } from '@tanstack/react-form'

export const sourceCount = ({ source }: { source?: ActiviteSource }) => {
  return source ? 1 : 0
}

export const updateSourcesParams =
  (params: URLSearchParams) =>
  (data: { value: { source?: ActiviteSource } }) => {
    data.value.source !== 'v1' && data.value.source !== 'v2'
      ? params.delete('source')
      : params.set('source', data.value.source)
  }

const options = formOptions({
  defaultValues: {} as DefaultValues<{
    source: ActiviteSource | undefined
  }>,
})

export const SourcesField = withForm({
  ...options,
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
